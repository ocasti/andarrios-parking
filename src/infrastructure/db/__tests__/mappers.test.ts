import { describe, it, expect } from 'vitest';
import {
  residentFromRow,
  residentToRow,
  visitorFromRow,
  visitorToRow,
  monthlyFeeFromRow,
  monthlyFeeToRow,
  pricingFromRow,
  pricingToRow,
  activityLogFromRow,
  activityLogToRow,
  dailyCloseFromRow,
  dailyCloseToRow,
  monthlyPaymentFromRow,
  monthlyPaymentToRow,
} from '../mappers';
import type {
  ResidentRow,
  VisitorRow,
  MonthlyFeeRow,
  PricingRow,
  ActivityLogRow,
  DailyCloseRow,
  MonthlyPaymentRow,
} from '../AndarriosDB';
import type { Resident, Visitor, MonthlyFee, PricingConfig, ActivityLog, DailyClose, MonthlyPayment } from '../../../domain/entities';

// ---- Resident ----

describe('residentFromRow / residentToRow', () => {
  const row: ResidentRow = {
    id: 'r1',
    cod: 'T01-101',
    torre: 1,
    piso: 1,
    apto: 101,
    placa: 'ABC123',
    tipo: 'carro',
    nombre: 'Omar Test',
    cel: '3001234567',
    fecha_registro: '2024-01-01T00:00:00.000Z',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z',
    deleted_at: null,
  };

  it('fromRow maps all fields from DB row to domain entity correctly', () => {
    const entity = residentFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.aptCode).toBe(row.cod);
    expect(entity.tower).toBe(row.torre);
    expect(entity.floor).toBe(row.piso);
    expect(entity.unit).toBe(row.apto);
    expect(entity.plate).toBe(row.placa);
    expect(entity.vehicleType).toBe('car');
    expect(entity.name).toBe(row.nombre);
    expect(entity.phone).toBe(row.cel);
    expect(entity.registrationDate).toBe(row.fecha_registro);
    expect(entity.createdAt).toBe(row.created_at);
    expect(entity.updatedAt).toBe(row.updated_at);
    expect(entity.deletedAt).toBe(row.deleted_at);
  });

  it('toRow maps all domain entity fields back to DB row correctly', () => {
    const entity = residentFromRow(row);
    const back = residentToRow(entity);
    expect(back.fecha_registro).toBe(entity.registrationDate);
    expect(back.created_at).toBe(entity.createdAt);
    expect(back.updated_at).toBe(entity.updatedAt);
    expect(back.deleted_at).toBe(entity.deletedAt);
  });

  it('round-trip: toRow(fromRow(row)) equals row', () => {
    expect(residentToRow(residentFromRow(row))).toEqual(row);
  });

  it('handles nullable fields correctly (null stays null)', () => {
    const rowWithNulls: ResidentRow = { ...row, cel: null, deleted_at: '2024-06-01T00:00:00.000Z' };
    const entity = residentFromRow(rowWithNulls);
    expect(entity.phone).toBeNull();
    expect(entity.deletedAt).toBe('2024-06-01T00:00:00.000Z');
  });

  it('translates motorcycle vehicleType correctly', () => {
    const motoRow: ResidentRow = { ...row, tipo: 'moto' };
    const entity = residentFromRow(motoRow);
    expect(entity.vehicleType).toBe('motorcycle');
    expect(residentToRow(entity).tipo).toBe('moto');
  });
});

// ---- Visitor ----

describe('visitorFromRow / visitorToRow', () => {
  const row: VisitorRow = {
    id: 'vis-1',
    cod: 'T02-202',
    placa: 'XYZ789',
    tipo: 'moto',
    nombre: 'Visitante Test',
    tel: '3109876543',
    entrada: '2024-06-01T10:00:00.000Z',
    salida: '2024-06-01T12:00:00.000Z',
    horas: 2,
    base: 2000,
    iva: 380,
    total: 2380,
    cortesia_aplica: false,
    created_at: '2024-06-01T10:00:00.000Z',
    updated_at: '2024-06-01T12:00:00.000Z',
  };

  it('fromRow maps all fields from DB row to domain entity correctly', () => {
    const entity = visitorFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.aptCode).toBe(row.cod);
    expect(entity.plate).toBe(row.placa);
    expect(entity.vehicleType).toBe('motorcycle');
    expect(entity.name).toBe(row.nombre);
    expect(entity.phone).toBe(row.tel);
    expect(entity.checkIn).toBe(row.entrada);
    expect(entity.checkOut).toBe(row.salida);
    expect(entity.hours).toBe(row.horas);
    expect(entity.baseAmount).toBe(row.base);
    expect(entity.tax).toBe(row.iva);
    expect(entity.total).toBe(row.total);
    expect(entity.courtesyApplies).toBe(row.cortesia_aplica);
    expect(entity.createdAt).toBe(row.created_at);
    expect(entity.updatedAt).toBe(row.updated_at);
  });

  it('toRow maps all domain entity fields back to DB row correctly', () => {
    const entity = visitorFromRow(row);
    const back = visitorToRow(entity);
    expect(back.cortesia_aplica).toBe(entity.courtesyApplies);
    expect(back.created_at).toBe(entity.createdAt);
    expect(back.updated_at).toBe(entity.updatedAt);
  });

  it('round-trip: toRow(fromRow(row)) equals row', () => {
    expect(visitorToRow(visitorFromRow(row))).toEqual(row);
  });

  it('handles nullable fields correctly (null stays null)', () => {
    const rowWithNulls: VisitorRow = {
      ...row,
      tel: null,
      salida: null,
      horas: null,
      base: null,
      iva: null,
      total: null,
    };
    const entity = visitorFromRow(rowWithNulls);
    expect(entity.phone).toBeNull();
    expect(entity.checkOut).toBeNull();
    expect(entity.hours).toBeNull();
    expect(entity.baseAmount).toBeNull();
    expect(entity.tax).toBeNull();
    expect(entity.total).toBeNull();
  });
});

// ---- MonthlyFee ----

describe('monthlyFeeFromRow / monthlyFeeToRow', () => {
  const row: MonthlyFeeRow = {
    id: 'mens-1',
    residente_id: 'res-1',
    mes_key: '2024-06',
    estado: 'pagado',
    fecha_pago: '2024-06-10T00:00:00.000Z',
    monto: 20000,
    created_at: '2024-06-01T00:00:00.000Z',
    updated_at: '2024-06-10T00:00:00.000Z',
  };

  it('fromRow maps all fields from DB row to domain entity correctly', () => {
    const entity = monthlyFeeFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.residentId).toBe(row.residente_id);
    expect(entity.monthKey).toBe(row.mes_key);
    expect(entity.status).toBe('paid');
    expect(entity.paymentDate).toBe(row.fecha_pago);
    expect(entity.amount).toBe(row.monto);
    expect(entity.createdAt).toBe(row.created_at);
    expect(entity.updatedAt).toBe(row.updated_at);
  });

  it('toRow maps all domain entity fields back to DB row correctly', () => {
    const entity = monthlyFeeFromRow(row);
    const back = monthlyFeeToRow(entity);
    expect(back.residente_id).toBe(entity.residentId);
    expect(back.mes_key).toBe(entity.monthKey);
    expect(back.fecha_pago).toBe(entity.paymentDate);
    expect(back.created_at).toBe(entity.createdAt);
    expect(back.updated_at).toBe(entity.updatedAt);
  });

  it('round-trip: toRow(fromRow(row)) equals row', () => {
    expect(monthlyFeeToRow(monthlyFeeFromRow(row))).toEqual(row);
  });

  it('translates pending status correctly', () => {
    const pendingRow: MonthlyFeeRow = { ...row, estado: 'pendiente' };
    const entity = monthlyFeeFromRow(pendingRow);
    expect(entity.status).toBe('pending');
    expect(monthlyFeeToRow(entity).estado).toBe('pendiente');
  });

  it('handles nullable fields correctly (null stays null)', () => {
    const rowWithNulls: MonthlyFeeRow = { ...row, fecha_pago: null, monto: null };
    const entity = monthlyFeeFromRow(rowWithNulls);
    expect(entity.paymentDate).toBeNull();
    expect(entity.amount).toBeNull();
    // round-trip
    expect(monthlyFeeToRow(entity)).toEqual(rowWithNulls);
  });
});

// ---- PricingConfig ----

describe('pricingFromRow / pricingToRow', () => {
  const row: PricingRow = {
    id: 1,
    carro_mes: 20000,
    moto_mes: 10000,
    vis_hora: 1000,
    horas_gratis: 2,
    iva: 19,
    capacidad_visitantes: 50,
    horas_min_recortesia: 6,
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  it('fromRow maps all fields from DB row to domain entity correctly', () => {
    const entity = pricingFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.carMonthlyRate).toBe(row.carro_mes);
    expect(entity.motorcycleMonthlyRate).toBe(row.moto_mes);
    expect(entity.hourlyRate).toBe(row.vis_hora);
    expect(entity.freeHours).toBe(row.horas_gratis);
    expect(entity.iva).toBe(row.iva);
    expect(entity.visitorCapacity).toBe(row.capacidad_visitantes);
    expect(entity.minHoursForCourtesy).toBe(row.horas_min_recortesia);
    expect(entity.updatedAt).toBe(row.updated_at);
  });

  it('toRow maps all domain entity fields back to DB row correctly', () => {
    const entity = pricingFromRow(row);
    const back = pricingToRow(entity);
    expect(back.carro_mes).toBe(entity.carMonthlyRate);
    expect(back.moto_mes).toBe(entity.motorcycleMonthlyRate);
    expect(back.vis_hora).toBe(entity.hourlyRate);
    expect(back.horas_gratis).toBe(entity.freeHours);
    expect(back.capacidad_visitantes).toBe(entity.visitorCapacity);
    expect(back.horas_min_recortesia).toBe(entity.minHoursForCourtesy);
    expect(back.updated_at).toBe(entity.updatedAt);
  });

  it('round-trip: toRow(fromRow(row)) equals row', () => {
    expect(pricingToRow(pricingFromRow(row))).toEqual(row);
  });

  it('preserves all numeric values', () => {
    const entity = pricingFromRow(row);
    expect(entity.carMonthlyRate).toBe(20000);
    expect(entity.motorcycleMonthlyRate).toBe(10000);
  });
});

// ---- ActivityLog ----

describe('activityLogFromRow / activityLogToRow', () => {
  const row: ActivityLogRow = {
    id: 'act-1',
    msg: 'Vehicle entered ABC123',
    ts: '2024-06-01T10:00:00.000Z',
    tipo: 'ingreso',
  };

  it('fromRow maps all fields correctly', () => {
    const entity = activityLogFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.msg).toBe(row.msg);
    expect(entity.ts).toBe(row.ts);
    expect(entity.category).toBe(row.tipo);
  });

  it('toRow maps all fields correctly', () => {
    const entity = activityLogFromRow(row);
    const back = activityLogToRow(entity);
    expect(back.id).toBe(entity.id);
    expect(back.msg).toBe(entity.msg);
    expect(back.ts).toBe(entity.ts);
    expect(back.tipo).toBe(entity.category);
  });

  it('round-trip: toRow(fromRow(row)) equals row', () => {
    expect(activityLogToRow(activityLogFromRow(row))).toEqual(row);
  });

  it('handles different category values correctly', () => {
    const rowSalida: ActivityLogRow = { ...row, id: 'act-2', tipo: 'salida' };
    const entity = activityLogFromRow(rowSalida);
    expect(entity.category).toBe('salida');
    expect(activityLogToRow(entity)).toEqual(rowSalida);
  });
});

// ---- DailyClose ----

describe('dailyCloseFromRow / dailyCloseToRow', () => {
  const row: DailyCloseRow = {
    id: 'cierre-1',
    fecha: '2024-06-01T23:59:00.000Z',
    fecha_str: '2024-06-01',
    cobros_vis: 5,
    total_vis: 15000,
    cobros_mens: 12,
    total_mens: 240000,
    total_iva: 2850,
    total: 257850,
  };

  it('fromRow maps all fields from DB row to domain entity correctly', () => {
    const entity = dailyCloseFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.closedAt).toBe(row.fecha);
    expect(entity.dateStr).toBe(row.fecha_str);
    expect(entity.visitorCharges).toBe(row.cobros_vis);
    expect(entity.visitorTotal).toBe(row.total_vis);
    expect(entity.monthlyCharges).toBe(row.cobros_mens);
    expect(entity.monthlyTotal).toBe(row.total_mens);
    expect(entity.totalTax).toBe(row.total_iva);
    expect(entity.total).toBe(row.total);
  });

  it('toRow maps all domain entity fields back to DB row correctly', () => {
    const entity = dailyCloseFromRow(row);
    const back = dailyCloseToRow(entity);
    expect(back.fecha_str).toBe(entity.dateStr);
    expect(back.cobros_vis).toBe(entity.visitorCharges);
    expect(back.total_vis).toBe(entity.visitorTotal);
    expect(back.cobros_mens).toBe(entity.monthlyCharges);
    expect(back.total_mens).toBe(entity.monthlyTotal);
    expect(back.total_iva).toBe(entity.totalTax);
  });

  it('round-trip: toRow(fromRow(row)) equals row', () => {
    expect(dailyCloseToRow(dailyCloseFromRow(row))).toEqual(row);
  });

  it('handles zero values correctly', () => {
    const rowZero: DailyCloseRow = {
      ...row,
      id: 'cierre-empty',
      cobros_vis: 0,
      total_vis: 0,
      cobros_mens: 0,
      total_mens: 0,
      total_iva: 0,
      total: 0,
    };
    const entity = dailyCloseFromRow(rowZero);
    expect(entity.visitorCharges).toBe(0);
    expect(entity.visitorTotal).toBe(0);
    expect(dailyCloseToRow(entity)).toEqual(rowZero);
  });
});

// ---- MonthlyPayment ----

describe('monthlyPaymentFromRow / monthlyPaymentToRow', () => {
  const row: MonthlyPaymentRow = {
    id: 'pago-1',
    residente_id: 'res-1',
    placa: 'ABC123',
    cod: 'T01-101',
    nombre: 'Juan Pérez',
    tipo: 'carro',
    fecha: '2024-06-15T10:00:00.000Z',
    monto: 20000,
    mes_key: '2024-06',
  };

  it('fromRow maps all fields from DB row to domain entity correctly', () => {
    const entity = monthlyPaymentFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.residentId).toBe(row.residente_id);
    expect(entity.plate).toBe(row.placa);
    expect(entity.aptCode).toBe(row.cod);
    expect(entity.name).toBe(row.nombre);
    expect(entity.vehicleType).toBe('car');
    expect(entity.date).toBe(row.fecha);
    expect(entity.amount).toBe(row.monto);
    expect(entity.monthKey).toBe(row.mes_key);
  });

  it('toRow maps all domain entity fields back to DB row correctly', () => {
    const entity = monthlyPaymentFromRow(row);
    const back = monthlyPaymentToRow(entity);
    expect(back.residente_id).toBe(entity.residentId);
    expect(back.mes_key).toBe(entity.monthKey);
  });

  it('round-trip: toRow(fromRow(row)) equals row', () => {
    expect(monthlyPaymentToRow(monthlyPaymentFromRow(row))).toEqual(row);
  });

  it('translates motorcycle vehicleType correctly', () => {
    const rowMoto: MonthlyPaymentRow = { ...row, id: 'pago-m', tipo: 'moto', monto: 10000 };
    const entity = monthlyPaymentFromRow(rowMoto);
    expect(entity.vehicleType).toBe('motorcycle');
    expect(entity.amount).toBe(10000);
    expect(monthlyPaymentToRow(entity)).toEqual(rowMoto);
  });
});
