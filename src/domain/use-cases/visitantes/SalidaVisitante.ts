import type { Visitante, Actividad } from '../../entities';
import type { IVisitanteRepository } from '../../repositories/IVisitanteRepository';
import type { IActividadRepository } from '../../repositories/IActividadRepository';
import { calcularCobro } from '../../services/CobroService';

export interface SalidaVisitanteInput {
  visitanteId: string;
  tarifaHora: number;
  horasGratis: number;
  porcentajeIva: number;
}

export interface SalidaVisitanteOutput {
  visitante: Visitante;
  horas: number;
  base: number;
  iva: number;
  total: number;
  horasCobradas: number;
  cortesiaAplicada: boolean;
}

export interface SalidaVisitanteDeps {
  visitanteRepo: IVisitanteRepository;
  actividadRepo: IActividadRepository;
  ahora(): string;
}

export async function salidaVisitante(
  input: SalidaVisitanteInput,
  deps: SalidaVisitanteDeps,
): Promise<SalidaVisitanteOutput> {
  const v = await deps.visitanteRepo.obtenerPorId(input.visitanteId);
  if (!v) throw new Error('Visitante no encontrado');

  const ts = deps.ahora();
  // Round to 4 decimal places to avoid float drift inflating ceil
  const horas = Math.max(
    0,
    Math.round(((new Date(ts).getTime() - new Date(v.entrada).getTime()) / 3_600_000) * 10_000) / 10_000,
  );

  const cobro = calcularCobro({
    horas,
    tarifaHora: input.tarifaHora,
    horasGratis: input.horasGratis,
    porcentajeIva: input.porcentajeIva,
    cortesiaAplica: v.cortesiaAplica,
  });

  const datos: Partial<Visitante> = {
    salida: ts,
    horas,
    base: cobro.base,
    iva: cobro.iva,
    total: cobro.total,
    updatedAt: ts,
  };

  await deps.visitanteRepo.registrarSalida(v.id, datos);

  const sufijo = v.cortesiaAplica ? '' : ' (sin cortesía)';
  const actividad: Actividad = {
    id: `${v.id}-salida`,
    msg: `Salida: ${v.placa} · Cobrado: $${cobro.total.toLocaleString('es-CO')}${sufijo}`,
    ts,
    tipo: 'visitante',
  };
  await deps.actividadRepo.registrar(actividad);

  return {
    visitante: { ...v, ...datos } as Visitante,
    horas,
    base: cobro.base,
    iva: cobro.iva,
    total: cobro.total,
    horasCobradas: cobro.horasCobradas,
    cortesiaAplicada: v.cortesiaAplica,
  };
}
