import type {
  Resident,
  Visitor,
  MonthlyFee,
  PricingConfig,
  ActivityLog,
  DailyClose,
  MonthlyPayment,
} from '../../domain/entities';
import type {
  ResidentRow,
  VisitorRow,
  MonthlyFeeRow,
  PricingRow,
  ActivityLogRow,
  DailyCloseRow,
  MonthlyPaymentRow,
} from './AndarriosDB';
import type { VehicleType, FeeStatus } from '../../domain/entities';

// --- Resident ---

export const residentFromRow = (r: ResidentRow): Resident => ({
  id: r.id,
  aptCode: r.cod,
  tower: r.torre,
  floor: r.piso,
  unit: r.apto,
  plate: r.placa,
  vehicleType: (r.tipo === 'carro' ? 'car' : 'motorcycle') as VehicleType,
  name: r.nombre,
  phone: r.cel,
  registrationDate: r.fecha_registro,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  deletedAt: r.deleted_at,
});

export const residentToRow = (r: Resident): ResidentRow => ({
  id: r.id,
  cod: r.aptCode,
  torre: r.tower,
  piso: r.floor,
  apto: r.unit,
  placa: r.plate,
  tipo: r.vehicleType === 'car' ? 'carro' : 'moto',
  nombre: r.name,
  cel: r.phone,
  fecha_registro: r.registrationDate,
  created_at: r.createdAt,
  updated_at: r.updatedAt,
  deleted_at: r.deletedAt,
});

// --- Visitor ---

export const visitorFromRow = (v: VisitorRow): Visitor => ({
  id: v.id,
  aptCode: v.cod,
  plate: v.placa,
  vehicleType: (v.tipo === 'carro' ? 'car' : 'motorcycle') as VehicleType,
  name: v.nombre,
  phone: v.tel,
  checkIn: v.entrada,
  checkOut: v.salida,
  hours: v.horas,
  baseAmount: v.base,
  tax: v.iva,
  total: v.total,
  courtesyApplies: v.cortesia_aplica,
  createdAt: v.created_at,
  updatedAt: v.updated_at,
});

export const visitorToRow = (v: Visitor): VisitorRow => ({
  id: v.id,
  cod: v.aptCode,
  placa: v.plate,
  tipo: v.vehicleType === 'car' ? 'carro' : 'moto',
  nombre: v.name,
  tel: v.phone,
  entrada: v.checkIn,
  salida: v.checkOut,
  horas: v.hours,
  base: v.baseAmount,
  iva: v.tax,
  total: v.total,
  cortesia_aplica: v.courtesyApplies,
  created_at: v.createdAt,
  updated_at: v.updatedAt,
});

// --- MonthlyFee ---

export const monthlyFeeFromRow = (m: MonthlyFeeRow): MonthlyFee => ({
  id: m.id,
  residentId: m.residente_id,
  monthKey: m.mes_key,
  status: (m.estado === 'pendiente' ? 'pending' : 'paid') as FeeStatus,
  paymentDate: m.fecha_pago,
  amount: m.monto,
  createdAt: m.created_at,
  updatedAt: m.updated_at,
});

export const monthlyFeeToRow = (m: MonthlyFee): MonthlyFeeRow => ({
  id: m.id,
  residente_id: m.residentId,
  mes_key: m.monthKey,
  estado: m.status === 'pending' ? 'pendiente' : 'pagado',
  fecha_pago: m.paymentDate,
  monto: m.amount,
  created_at: m.createdAt,
  updated_at: m.updatedAt,
});

// --- PricingConfig ---

export const pricingFromRow = (t: PricingRow): PricingConfig => ({
  id: t.id,
  carMonthlyRate: t.carro_mes,
  motorcycleMonthlyRate: t.moto_mes,
  hourlyRate: t.vis_hora,
  freeHours: t.horas_gratis,
  iva: t.iva,
  visitorCapacity: t.capacidad_visitantes,
  minHoursForCourtesy: t.horas_min_recortesia,
  updatedAt: t.updated_at,
});

export const pricingToRow = (t: PricingConfig): PricingRow => ({
  id: t.id,
  carro_mes: t.carMonthlyRate,
  moto_mes: t.motorcycleMonthlyRate,
  vis_hora: t.hourlyRate,
  horas_gratis: t.freeHours,
  iva: t.iva,
  capacidad_visitantes: t.visitorCapacity,
  horas_min_recortesia: t.minHoursForCourtesy,
  updated_at: t.updatedAt,
});

// --- ActivityLog ---

export const activityLogFromRow = (a: ActivityLogRow): ActivityLog => ({
  id: a.id,
  msg: a.msg,
  ts: a.ts,
  category: a.tipo,
});

export const activityLogToRow = (a: ActivityLog): ActivityLogRow => ({
  id: a.id,
  msg: a.msg,
  ts: a.ts,
  tipo: a.category,
});

// --- DailyClose ---

export const dailyCloseFromRow = (c: DailyCloseRow): DailyClose => ({
  id: c.id,
  closedAt: c.fecha,
  dateStr: c.fecha_str,
  visitorCharges: c.cobros_vis,
  visitorTotal: c.total_vis,
  monthlyCharges: c.cobros_mens,
  monthlyTotal: c.total_mens,
  totalTax: c.total_iva,
  total: c.total,
});

export const dailyCloseToRow = (c: DailyClose): DailyCloseRow => ({
  id: c.id,
  fecha: c.closedAt,
  fecha_str: c.dateStr,
  cobros_vis: c.visitorCharges,
  total_vis: c.visitorTotal,
  cobros_mens: c.monthlyCharges,
  total_mens: c.monthlyTotal,
  total_iva: c.totalTax,
  total: c.total,
});

// --- MonthlyPayment ---

export const monthlyPaymentFromRow = (p: MonthlyPaymentRow): MonthlyPayment => ({
  id: p.id,
  residentId: p.residente_id,
  plate: p.placa,
  aptCode: p.cod,
  name: p.nombre,
  vehicleType: (p.tipo === 'carro' ? 'car' : 'motorcycle') as VehicleType,
  date: p.fecha,
  amount: p.monto,
  monthKey: p.mes_key,
});

export const monthlyPaymentToRow = (p: MonthlyPayment): MonthlyPaymentRow => ({
  id: p.id,
  residente_id: p.residentId,
  placa: p.plate,
  cod: p.aptCode,
  nombre: p.name,
  tipo: p.vehicleType === 'car' ? 'carro' : 'moto',
  fecha: p.date,
  monto: p.amount,
  mes_key: p.monthKey,
});
