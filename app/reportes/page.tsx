'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import RequireAdmin from '@/components/RequireAdmin';
import { fmtD, fmtT, mesKey } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase';
import * as XLSX from 'xlsx-js-style';

const PAGE = 1000;

async function fetchAll(table: string, build: (q: any) => any): Promise<any[]> {
  const sb = getSupabase();
  const all: any[] = [];
  let from = 0;
  while (true) {
    let q: any = sb.from(table).select('*');
    q = build(q);
    const { data, error } = await q.range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

function dl(rows: any[][], sheet: string, file: string) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), sheet);
  XLSX.writeFile(wb, file);
}

export default function ReportesPage() {
  const [busy, setBusy] = useState<string | null>(null);
  const sb = getSupabase();

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    try { await fn(); } catch (e: any) { alert('Error: ' + (e?.message ?? e)); }
    finally { setBusy(null); }
  }

  const expResidentes = () => run('Residentes', async () => {
    const data = await fetchAll('residentes', (q) => q.is('deleted_at', null).order('cod', { ascending: true }));
    if (!data.length) return alert('No hay residentes.');
    const rows: any[][] = [['Código', 'Torre', 'Piso', 'Placa', 'Tipo', 'Propietario', 'Celular', 'Fecha registro']];
    data.forEach((r) => rows.push([r.cod, r.torre, r.piso, r.placa, r.tipo, r.nombre, r.cel || '', fmtD(r.fecha_registro || r.created_at)]));
    dl(rows, 'Residentes', 'Andarrios_Residentes.xlsx');
  });

  const expMens = () => run('Mensualidades', async () => {
    const mk = mesKey();
    const tarRes = await sb.from('tarifas').select('*').eq('id', 1).maybeSingle();
    const tarifas = tarRes.data ?? { carro_mes: 20000, moto_mes: 10000 };
    const residentes = await fetchAll('residentes', (q) => q.is('deleted_at', null).order('cod', { ascending: true }));
    if (!residentes.length) return alert('No hay residentes.');
    const ids = residentes.map((r) => r.id);
    const mens = await fetchAll('mensualidades', (q) => q.eq('mes_key', mk).in('residente_id', ids));
    const estMap = new Map(mens.map((m) => [m.residente_id, m.estado]));
    const rows: any[][] = [['Código', 'Placa', 'Propietario', 'Tipo', 'Valor', 'Estado', 'Mes']];
    residentes.forEach((r) => {
      const est = estMap.get(r.id) ?? 'pendiente';
      const val = r.tipo === 'carro' ? tarifas.carro_mes : tarifas.moto_mes;
      rows.push([r.cod, r.placa, r.nombre, r.tipo, val, est, mk]);
    });
    dl(rows, 'Mensualidades', 'Andarrios_Mensualidades.xlsx');
  });

  const expHistorial = () => run('Historial', async () => {
    const data = await fetchAll('visitantes', (q) => q.not('salida', 'is', null).order('salida', { ascending: false }));
    if (!data.length) return alert('Sin historial.');
    const rows: any[][] = [['Fecha', 'Placa', 'Tipo', 'Apto', 'Nombre', 'Entrada', 'Salida', 'Horas', 'Subtotal', 'IVA', 'Total']];
    data.forEach((h) => rows.push([fmtD(h.salida), h.placa, h.tipo, h.cod, h.nombre || '', fmtT(h.entrada), fmtT(h.salida), (h.horas ?? 0).toFixed(2), h.base ?? 0, h.iva ?? 0, h.total ?? 0]));
    dl(rows, 'Historial', 'Andarrios_Historial.xlsx');
  });

  const expControl = () => run('Control de acceso', async () => {
    const wb = XLSX.utils.book_new();
    const blq = await fetchAll('bloqueados', (q) => q.order('fecha_bloqueo', { ascending: false }));
    const placas = await fetchAll('placas_aprobadas', (q) => q.order('fecha_aprobacion', { ascending: false }));
    const b: any[][] = [['Código apto', 'Motivo', 'Fecha bloqueo', 'Estado']];
    blq.forEach((x) => b.push([x.cod, x.motivo, fmtD(x.fecha_bloqueo), x.desbloqueado_at ? 'Desbloqueado' : 'Bloqueado']));
    const a: any[][] = [['Código apto', 'Placa', 'Tipo', 'Fecha aprobación', 'Estado']];
    placas.forEach((p) => a.push([p.cod, p.placa, p.tipo, fmtD(p.fecha_aprobacion), p.deleted_at ? 'Revocada' : 'Activa']));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(b), 'Bloqueados');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(a), 'PlacasAprobadas');
    XLSX.writeFile(wb, 'Andarrios_Control.xlsx');
  });

  const expCierres = () => run('Cierres de caja', async () => {
    const data = await fetchAll('cierres_caja', (q) => q.order('fecha', { ascending: false }));
    if (!data.length) return alert('Sin cierres.');
    const rows: any[][] = [['Fecha', 'Cobros visitantes', 'Total visitantes', 'Mens. pagadas', 'Total mensualidades', 'IVA', 'Total caja']];
    data.forEach((c) => rows.push([fmtD(c.fecha), c.cobros_vis, c.total_vis, c.cobros_mens, c.total_mens, c.total_iva, c.total]));
    dl(rows, 'Cierres', 'Andarrios_Cierres.xlsx');
  });

  const expMov = () => run('Movimientos completos', async () => {
    const wb = XLSX.utils.book_new();
    const visitantes = await fetchAll('visitantes', (q) => q.order('entrada', { ascending: false }));
    const pagos = await fetchAll('pagos_mensualidades', (q) => q.order('fecha', { ascending: false }));
    const cierres = await fetchAll('cierres_caja', (q) => q.order('fecha', { ascending: false }));
    const rows: any[][] = [['Fecha', 'Hora entrada', 'Hora salida', 'Tipo movimiento', 'Tipo vehículo', 'Placa', 'Nombre', 'Teléfono', 'Apto', 'Horas', 'Subtotal', 'IVA', 'Total']];
    visitantes.forEach((v) => {
      const tipoMov = v.salida ? 'Salida visitante' : 'Ingreso activo';
      rows.push([fmtD(v.entrada), fmtT(v.entrada), v.salida ? fmtT(v.salida) : '(en parqueadero)', tipoMov, v.tipo, v.placa, v.nombre || '', v.tel || '', v.cod, (v.horas ?? 0).toFixed(2), v.base ?? '—', v.iva ?? '—', v.total ?? '—']);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Movimientos visitantes');
    const r2: any[][] = [['Fecha', 'Hora', 'Placa', 'Propietario', 'Apto', 'Tipo vehículo', 'Valor pagado']];
    pagos.forEach((p) => r2.push([fmtD(p.fecha), fmtT(p.fecha), p.placa || '', p.nombre || '', p.cod || '', p.tipo || '', p.monto]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(r2), 'Pagos mensualidades');
    const r3: any[][] = [['Fecha', 'Cobros vis', 'Total vis', 'Mens. pagadas', 'Total mens', 'IVA', 'Total caja']];
    cierres.forEach((c) => r3.push([fmtD(c.fecha), c.cobros_vis, c.total_vis, c.cobros_mens, c.total_mens, c.total_iva, c.total]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(r3), 'Cierres');
    XLSX.writeFile(wb, `Andarrios_Movimientos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  });

  const card = (icon: string, color: string, title: string, desc: string, action: () => void, primary = false) => (
    <div style={{ background: 'var(--bg3)', border: primary ? '2px solid var(--leaf4)' : '1px solid var(--bd)', borderRadius: 10, padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 6px rgba(15,31,24,.08)' }}>
      <div style={{ fontSize: 34, color, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 5 }}>{title}</h3>
      <p style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 14 }}>{desc}</p>
      <button className={primary ? 'btn bp' : 'btn bex'} onClick={action} disabled={!!busy}>
        {busy === title ? '⏳ Generando…' : '📥 Descargar'}
      </button>
    </div>
  );

  return (
    <AppShell><RequireAdmin>
      <div className="ph"><h2>Reportes</h2><p>Descarga datos completos en Excel (paginado en bloques de 1000)</p></div>
      <div className="g2" style={{ gap: '1rem' }}>
        {card('👥', 'var(--leaf3)', 'Residentes', 'Vehículos y propietarios del conjunto', expResidentes)}
        {card('📅', 'var(--gold)', 'Mensualidades', 'Estado de pagos del mes actual', expMens)}
        {card('🧾', 'var(--leaf2)', 'Historial', 'Cobros completados de visitantes', expHistorial)}
        {card('🚫', 'var(--red)', 'Control de acceso', 'Bloqueados y placas aprobadas', expControl)}
        {card('🏦', 'var(--leaf)', 'Cierres de caja', 'Historial de todos los cierres', expCierres)}
        {card('📊', 'var(--leaf)', 'Movimientos completos', 'Movimientos, pagos y cierres en un solo archivo', expMov, true)}
      </div>
    </RequireAdmin></AppShell>
  );
}
