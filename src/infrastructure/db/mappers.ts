import type {
  Residente,
  Visitante,
  Mensualidad,
  Tarifa,
  Actividad,
  CierreCaja,
  PagoMensualidad,
} from '../../domain/entities';
import type {
  ResidenteRow,
  VisitanteRow,
  MensualidadRow,
  TarifaRow,
  ActividadRow,
  CierreCajaRow,
  PagoMensualidadRow,
} from './AndarriosDB';

// --- Residente ---

export const residenteFromRow = (r: ResidenteRow): Residente => ({
  id: r.id,
  cod: r.cod,
  torre: r.torre,
  piso: r.piso,
  apto: r.apto,
  placa: r.placa,
  tipo: r.tipo as Residente['tipo'],
  nombre: r.nombre,
  cel: r.cel,
  fechaRegistro: r.fecha_registro,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  deletedAt: r.deleted_at,
});

export const residenteToRow = (r: Residente): ResidenteRow => ({
  id: r.id,
  cod: r.cod,
  torre: r.torre,
  piso: r.piso,
  apto: r.apto,
  placa: r.placa,
  tipo: r.tipo,
  nombre: r.nombre,
  cel: r.cel,
  fecha_registro: r.fechaRegistro,
  created_at: r.createdAt,
  updated_at: r.updatedAt,
  deleted_at: r.deletedAt,
});

// --- Visitante ---

export const visitanteFromRow = (v: VisitanteRow): Visitante => ({
  id: v.id,
  cod: v.cod,
  placa: v.placa,
  tipo: v.tipo as Visitante['tipo'],
  nombre: v.nombre,
  tel: v.tel,
  entrada: v.entrada,
  salida: v.salida,
  horas: v.horas,
  base: v.base,
  iva: v.iva,
  total: v.total,
  cortesiaAplica: v.cortesia_aplica,
  createdAt: v.created_at,
  updatedAt: v.updated_at,
});

export const visitanteToRow = (v: Visitante): VisitanteRow => ({
  id: v.id,
  cod: v.cod,
  placa: v.placa,
  tipo: v.tipo,
  nombre: v.nombre,
  tel: v.tel,
  entrada: v.entrada,
  salida: v.salida,
  horas: v.horas,
  base: v.base,
  iva: v.iva,
  total: v.total,
  cortesia_aplica: v.cortesiaAplica,
  created_at: v.createdAt,
  updated_at: v.updatedAt,
});

// --- Mensualidad ---

export const mensualidadFromRow = (m: MensualidadRow): Mensualidad => ({
  id: m.id,
  residenteId: m.residente_id,
  mesKey: m.mes_key,
  estado: m.estado as Mensualidad['estado'],
  fechaPago: m.fecha_pago,
  monto: m.monto,
  createdAt: m.created_at,
  updatedAt: m.updated_at,
});

export const mensualidadToRow = (m: Mensualidad): MensualidadRow => ({
  id: m.id,
  residente_id: m.residenteId,
  mes_key: m.mesKey,
  estado: m.estado,
  fecha_pago: m.fechaPago,
  monto: m.monto,
  created_at: m.createdAt,
  updated_at: m.updatedAt,
});

// --- Tarifa ---

export const tarifaFromRow = (t: TarifaRow): Tarifa => ({
  id: t.id,
  carroMes: t.carro_mes,
  motoMes: t.moto_mes,
  visHora: t.vis_hora,
  horasGratis: t.horas_gratis,
  iva: t.iva,
  capacidadVisitantes: t.capacidad_visitantes,
  horasMinRecortesia: t.horas_min_recortesia,
  updatedAt: t.updated_at,
});

export const tarifaToRow = (t: Tarifa): TarifaRow => ({
  id: t.id,
  carro_mes: t.carroMes,
  moto_mes: t.motoMes,
  vis_hora: t.visHora,
  horas_gratis: t.horasGratis,
  iva: t.iva,
  capacidad_visitantes: t.capacidadVisitantes,
  horas_min_recortesia: t.horasMinRecortesia,
  updated_at: t.updatedAt,
});

// --- Actividad ---

export const actividadFromRow = (a: ActividadRow): Actividad => ({
  id: a.id,
  msg: a.msg,
  ts: a.ts,
  tipo: a.tipo,
});

export const actividadToRow = (a: Actividad): ActividadRow => ({
  id: a.id,
  msg: a.msg,
  ts: a.ts,
  tipo: a.tipo,
});

// --- CierreCaja ---

export const cierreCajaFromRow = (c: CierreCajaRow): CierreCaja => ({
  id: c.id,
  fecha: c.fecha,
  fechaStr: c.fecha_str,
  cobrosVis: c.cobros_vis,
  totalVis: c.total_vis,
  cobrosMens: c.cobros_mens,
  totalMens: c.total_mens,
  totalIva: c.total_iva,
  total: c.total,
});

export const cierreCajaToRow = (c: CierreCaja): CierreCajaRow => ({
  id: c.id,
  fecha: c.fecha,
  fecha_str: c.fechaStr,
  cobros_vis: c.cobrosVis,
  total_vis: c.totalVis,
  cobros_mens: c.cobrosMens,
  total_mens: c.totalMens,
  total_iva: c.totalIva,
  total: c.total,
});

// --- PagoMensualidad ---

export const pagoMensualidadFromRow = (p: PagoMensualidadRow): PagoMensualidad => ({
  id: p.id,
  residenteId: p.residente_id,
  placa: p.placa,
  cod: p.cod,
  nombre: p.nombre,
  tipo: p.tipo as PagoMensualidad['tipo'],
  fecha: p.fecha,
  monto: p.monto,
  mesKey: p.mes_key,
});

export const pagoMensualidadToRow = (p: PagoMensualidad): PagoMensualidadRow => ({
  id: p.id,
  residente_id: p.residenteId,
  placa: p.placa,
  cod: p.cod,
  nombre: p.nombre,
  tipo: p.tipo,
  fecha: p.fecha,
  monto: p.monto,
  mes_key: p.mesKey,
});
