'use client';
// Capa de acciones — escribe en IndexedDB y encola para Supabase.
import { db } from './db';
import { enqueue } from './sync';
import type { Residente, Visitante, Mensualidad, PagoMensualidad, Bloqueado, PlacaAprobada, CierreCaja, Tipo, Tarifas } from './types';

const uuid = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0; const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

const now = () => new Date().toISOString();

// ====== RESIDENTES ======
export async function crearResidente(input: Omit<Residente, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) {
  const id = uuid();
  const payload: Residente = { ...input, id, fecha_registro: input.fecha_registro ?? now(), created_at: now(), updated_at: now(), client_id: id };
  await db().residentes.put(payload);
  // crea mensualidad pendiente del mes actual
  const mk = mesKey();
  const mens: Mensualidad = { id: uuid(), client_id: uuid(), residente_id: id, mes_key: mk, estado: 'pendiente', created_at: now(), updated_at: now() };
  await db().mensualidades.put(mens);
  await enqueue({ table: 'residentes', op: 'insert', payload });
  await enqueue({ table: 'mensualidades', op: 'insert', payload: mens });
  await logActividad(`Vehículo registrado: ${payload.placa} (${payload.tipo}) · ${payload.cod} · ${payload.nombre}`);
  return payload;
}

export async function eliminarResidente(id: string) {
  const r = await db().residentes.get(id);
  if (!r) return;
  const stamp = now();
  await db().residentes.update(id, { deleted_at: stamp, updated_at: stamp });
  await enqueue({ table: 'residentes', op: 'update', where: { id }, payload: { deleted_at: stamp, updated_at: stamp } });
  await logActividad(`Vehículo eliminado: ${r.placa} · ${r.cod}`);
}

// ====== VISITANTES ======
import { getSupabase } from './supabase';

/**
 * Verifica contra Supabase si la placa tuvo una salida en las últimas
 * `horasMin` horas. Si sí, la cortesía NO aplica en este ingreso.
 */
async function chequearCortesia(placa: string, horasMin: number): Promise<boolean> {
  if (horasMin <= 0) return true;
  try {
    const sb = getSupabase();
    const desde = new Date(Date.now() - horasMin * 3600 * 1000).toISOString();
    const { data } = await sb
      .from('visitantes')
      .select('id, salida')
      .eq('placa', placa)
      .not('salida', 'is', null)
      .gte('salida', desde)
      .limit(1);
    return !data || data.length === 0; // si encontró salida reciente, NO aplica
  } catch {
    return true; // offline / falla → conservador, dejamos cortesía
  }
}

export async function ingresarVisitante(input: { cod: string; placa: string; tipo: Tipo; nombre?: string; tel?: string }, opts?: { horasMinRecortesia?: number }) {
  const id = uuid();
  const horasMin = opts?.horasMinRecortesia ?? 6;
  const cortesia_aplica = await chequearCortesia(input.placa, horasMin);
  const payload: Visitante = {
    id, client_id: id, ...input, entrada: now(),
    salida: null, cortesia_aplica,
    created_at: now(), updated_at: now(),
  };
  await db().visitantes.put(payload);
  await enqueue({ table: 'visitantes', op: 'insert', payload });
  const sufijo = cortesia_aplica ? '' : ' · sin cortesía (reingreso)';
  await logActividad(`Ingreso visitante: ${payload.placa} (${payload.tipo}) → ${payload.cod}${sufijo}`);
  return payload;
}

export async function salidaVisitante(id: string, tarifas: Tarifas) {
  const v = await db().visitantes.get(id);
  if (!v) throw new Error('Visitante no encontrado');
  const entradaT = new Date(v.entrada).getTime();
  const horas = (Date.now() - entradaT) / 3600000;
  const horasGratisEfectivas = (v.cortesia_aplica ?? true) ? tarifas.horas_gratis : 0;
  const horasCobradas = Math.max(0, Math.ceil(horas - horasGratisEfectivas));
  const base = horasCobradas * tarifas.vis_hora;
  const iva = Math.round((base * tarifas.iva) / (100 + tarifas.iva));
  const total = base; // total ya incluye IVA en el base; mantener compat con HTML original
  const stamp = now();
  const update = { salida: stamp, horas, base, iva, total, updated_at: stamp };
  await db().visitantes.update(id, update);
  await enqueue({ table: 'visitantes', op: 'update', where: { id }, payload: update });
  const sufijo = (v.cortesia_aplica ?? true) ? '' : ' (sin cortesía)';
  await logActividad(`Salida: ${v.placa} · Cobrado: $${total.toLocaleString('es-CO')}${sufijo}`);
  return { v: { ...v, ...update }, horas, base, iva, total, horasCobradas, cortesiaAplicada: (v.cortesia_aplica ?? true) };
}

// ====== MENSUALIDADES ======
export async function marcarPagado(residente_id: string, tarifas: Tarifas) {
  const mk = mesKey();
  const r = await db().residentes.get(residente_id);
  if (!r) return;
  const monto = r.tipo === 'carro' ? tarifas.carro_mes : tarifas.moto_mes;
  const stamp = now();
  let mens = await db().mensualidades.where('[residente_id+mes_key]').equals([residente_id, mk]).first();
  if (!mens) {
    mens = { id: uuid(), client_id: uuid(), residente_id, mes_key: mk, estado: 'pagado', fecha_pago: stamp, monto, created_at: stamp, updated_at: stamp };
    await db().mensualidades.put(mens);
    await enqueue({ table: 'mensualidades', op: 'insert', payload: mens });
  } else {
    const upd = { estado: 'pagado' as const, fecha_pago: stamp, monto, updated_at: stamp };
    await db().mensualidades.update(mens.id, upd);
    await enqueue({ table: 'mensualidades', op: 'update', where: { id: mens.id }, payload: upd });
  }
  // Registrar pago para audit/cierre
  const pago: PagoMensualidad = {
    id: uuid(), client_id: uuid(), residente_id, placa: r.placa, cod: r.cod, nombre: r.nombre, tipo: r.tipo,
    fecha: stamp, monto, mes_key: mk,
  };
  await db().pagos.put(pago);
  await enqueue({ table: 'pagos_mensualidades', op: 'insert', payload: pago });
  await logActividad(`Mensualidad pagada: ${r.placa} · ${r.cod} · $${monto.toLocaleString('es-CO')}`);
}

// ====== BLOQUEADOS ======
export async function bloquearApto(cod: string, motivo: string) {
  // Si ya está bloqueado, no duplicar
  const existing = await db().bloqueados.where('cod').equals(cod).filter((b) => !b.desbloqueado_at).first();
  if (existing) return;
  const payload: Bloqueado = {
    id: uuid(), client_id: uuid(), cod, motivo: motivo || 'Mora de mensualidad',
    fecha_bloqueo: now(), desbloqueado_at: null,
  };
  await db().bloqueados.put(payload);
  await enqueue({ table: 'bloqueados', op: 'insert', payload });
  await logActividad(`Apto bloqueado: ${cod} — ${payload.motivo}`);
}

export async function desbloquearApto(cod: string) {
  const b = await db().bloqueados.where('cod').equals(cod).filter((x) => !x.desbloqueado_at).first();
  if (!b) return;
  const stamp = now();
  await db().bloqueados.update(b.id, { desbloqueado_at: stamp });
  await enqueue({ table: 'bloqueados', op: 'update', where: { id: b.id }, payload: { desbloqueado_at: stamp } });
  await logActividad(`Apto desbloqueado: ${cod}`);
}

// ====== PLACAS APROBADAS ======
export async function aprobarPlaca(cod: string, placa: string, tipo: Tipo) {
  const exists = await db().placas_aprobadas.where('placa').equals(placa).filter((p) => p.cod === cod && !p.deleted_at).first();
  if (exists) return;
  const payload: PlacaAprobada = {
    id: uuid(), client_id: uuid(), cod, placa, tipo,
    fecha_aprobacion: now(), deleted_at: null,
  };
  await db().placas_aprobadas.put(payload);
  await enqueue({ table: 'placas_aprobadas', op: 'insert', payload });
  await logActividad(`Placa aprobada: ${placa} → ${cod}`);
}

export async function revocarPlaca(id: string) {
  const stamp = now();
  await db().placas_aprobadas.update(id, { deleted_at: stamp });
  await enqueue({ table: 'placas_aprobadas', op: 'update', where: { id }, payload: { deleted_at: stamp } });
  await logActividad(`Placa revocada (id ${id})`);
}

// ====== CIERRE DE CAJA ======
export async function realizarCierre(stats: Omit<CierreCaja, 'id' | 'client_id' | 'fecha' | 'fecha_str'>) {
  const today = new Date().toISOString().slice(0, 10);
  const id = uuid();
  const payload: CierreCaja = { id, client_id: id, fecha: now(), fecha_str: today, ...stats };
  await db().cierres.put(payload);
  await enqueue({ table: 'cierres_caja', op: 'insert', payload });
  await logActividad(`Cierre de caja: $${stats.total.toLocaleString('es-CO')} (${stats.cobros_vis} vis · ${stats.cobros_mens} mens)`);
}

// ====== TARIFAS ======
export async function guardarTarifas(t: Partial<Tarifas>) {
  const stamp = now();
  const merged: Tarifas = { id: 1, carro_mes: 20000, moto_mes: 10000, vis_hora: 1000, horas_gratis: 2, iva: 19, capacidad_visitantes: 0, horas_min_recortesia: 6, ...t, updated_at: stamp };
  await db().tarifas.put(merged);
  await enqueue({ table: 'tarifas', op: 'update', where: { id: 1 }, payload: { ...t, updated_at: stamp } });
  await logActividad('Tarifas actualizadas');
}

// ====== ACTIVIDAD ======
export async function logActividad(msg: string, tipo: string = 'info') {
  const id = uuid();
  const payload = { id, client_id: id, msg, ts: now(), tipo };
  await db().actividad.put(payload as any);
  await enqueue({ table: 'actividad', op: 'insert', payload });
}

// ====== HELPERS ======
import { colMonthKey } from './tz';
export function mesKey(d = new Date()) {
  return colMonthKey(d);
}
export function genCod(torre: number, piso: number, apto: number) {
  return `T${String(torre).padStart(2, '0')}-${piso}0${apto}`;
}
export function calcCobroVisitante(horas: number, tarifas: Tarifas, cortesiaAplica: boolean = true) {
  const horasGratis = cortesiaAplica ? tarifas.horas_gratis : 0;
  const horasCobradas = Math.max(0, Math.ceil(horas - horasGratis));
  const base = horasCobradas * tarifas.vis_hora;
  const iva = Math.round((base * tarifas.iva) / (100 + tarifas.iva));
  return { base, iva, total: base, horasCobradas, horasGratis };
}
export const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
export const fmtT = (d: string | number | Date) => new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' });
export const fmtD = (d: string | number | Date) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Bogota' });
