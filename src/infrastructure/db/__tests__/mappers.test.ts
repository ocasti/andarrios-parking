import { describe, it, expect } from 'vitest';
import {
  residenteFromRow,
  residenteToRow,
  visitanteFromRow,
  visitanteToRow,
  mensualidadFromRow,
  mensualidadToRow,
  tarifaFromRow,
  tarifaToRow,
  actividadFromRow,
  actividadToRow,
  cierreCajaFromRow,
  cierreCajaToRow,
  pagoMensualidadFromRow,
  pagoMensualidadToRow,
} from '../mappers';
import type {
  ResidenteRow,
  VisitanteRow,
  MensualidadRow,
  TarifaRow,
  ActividadRow,
  CierreCajaRow,
  PagoMensualidadRow,
} from '../AndarriosDB';
import type { Residente, Visitante, Mensualidad, Tarifa, Actividad, CierreCaja, PagoMensualidad } from '../../../domain/entities';

// ---- Residente ----

describe('residenteFromRow / residenteToRow', () => {
  const row: ResidenteRow = {
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

  it('fromRow mapea todos los campos snake_case a camelCase correctamente', () => {
    const entity = residenteFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.cod).toBe(row.cod);
    expect(entity.torre).toBe(row.torre);
    expect(entity.piso).toBe(row.piso);
    expect(entity.apto).toBe(row.apto);
    expect(entity.placa).toBe(row.placa);
    expect(entity.tipo).toBe(row.tipo);
    expect(entity.nombre).toBe(row.nombre);
    expect(entity.cel).toBe(row.cel);
    expect(entity.fechaRegistro).toBe(row.fecha_registro);
    expect(entity.createdAt).toBe(row.created_at);
    expect(entity.updatedAt).toBe(row.updated_at);
    expect(entity.deletedAt).toBe(row.deleted_at);
  });

  it('toRow mapea todos los campos camelCase a snake_case correctamente', () => {
    const entity = residenteFromRow(row);
    const back = residenteToRow(entity);
    expect(back.fecha_registro).toBe(entity.fechaRegistro);
    expect(back.created_at).toBe(entity.createdAt);
    expect(back.updated_at).toBe(entity.updatedAt);
    expect(back.deleted_at).toBe(entity.deletedAt);
  });

  it('round-trip: toRow(fromRow(row)) === row', () => {
    expect(residenteToRow(residenteFromRow(row))).toEqual(row);
  });

  it('maneja campos nullable correctamente (null → null)', () => {
    const rowWithNulls: ResidenteRow = { ...row, cel: null, deleted_at: '2024-06-01T00:00:00.000Z' };
    const entity = residenteFromRow(rowWithNulls);
    expect(entity.cel).toBeNull();
    expect(entity.deletedAt).toBe('2024-06-01T00:00:00.000Z');
  });
});

// ---- Visitante ----

describe('visitanteFromRow / visitanteToRow', () => {
  const row: VisitanteRow = {
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

  it('fromRow mapea todos los campos snake_case a camelCase correctamente', () => {
    const entity = visitanteFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.cod).toBe(row.cod);
    expect(entity.placa).toBe(row.placa);
    expect(entity.tipo).toBe(row.tipo);
    expect(entity.nombre).toBe(row.nombre);
    expect(entity.tel).toBe(row.tel);
    expect(entity.entrada).toBe(row.entrada);
    expect(entity.salida).toBe(row.salida);
    expect(entity.horas).toBe(row.horas);
    expect(entity.base).toBe(row.base);
    expect(entity.iva).toBe(row.iva);
    expect(entity.total).toBe(row.total);
    expect(entity.cortesiaAplica).toBe(row.cortesia_aplica);
    expect(entity.createdAt).toBe(row.created_at);
    expect(entity.updatedAt).toBe(row.updated_at);
  });

  it('toRow mapea todos los campos camelCase a snake_case correctamente', () => {
    const entity = visitanteFromRow(row);
    const back = visitanteToRow(entity);
    expect(back.cortesia_aplica).toBe(entity.cortesiaAplica);
    expect(back.created_at).toBe(entity.createdAt);
    expect(back.updated_at).toBe(entity.updatedAt);
  });

  it('round-trip: toRow(fromRow(row)) === row', () => {
    expect(visitanteToRow(visitanteFromRow(row))).toEqual(row);
  });

  it('maneja campos nullable correctamente (null → null)', () => {
    const rowWithNulls: VisitanteRow = {
      ...row,
      tel: null,
      salida: null,
      horas: null,
      base: null,
      iva: null,
      total: null,
    };
    const entity = visitanteFromRow(rowWithNulls);
    expect(entity.tel).toBeNull();
    expect(entity.salida).toBeNull();
    expect(entity.horas).toBeNull();
    expect(entity.base).toBeNull();
    expect(entity.iva).toBeNull();
    expect(entity.total).toBeNull();
  });
});

// ---- Mensualidad ----

describe('mensualidadFromRow / mensualidadToRow', () => {
  const row: MensualidadRow = {
    id: 'mens-1',
    residente_id: 'res-1',
    mes_key: '2024-06',
    estado: 'pagado',
    fecha_pago: '2024-06-10T00:00:00.000Z',
    monto: 20000,
    created_at: '2024-06-01T00:00:00.000Z',
    updated_at: '2024-06-10T00:00:00.000Z',
  };

  it('fromRow mapea todos los campos snake_case a camelCase correctamente', () => {
    const entity = mensualidadFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.residenteId).toBe(row.residente_id);
    expect(entity.mesKey).toBe(row.mes_key);
    expect(entity.estado).toBe(row.estado);
    expect(entity.fechaPago).toBe(row.fecha_pago);
    expect(entity.monto).toBe(row.monto);
    expect(entity.createdAt).toBe(row.created_at);
    expect(entity.updatedAt).toBe(row.updated_at);
  });

  it('toRow mapea todos los campos camelCase a snake_case correctamente', () => {
    const entity = mensualidadFromRow(row);
    const back = mensualidadToRow(entity);
    expect(back.residente_id).toBe(entity.residenteId);
    expect(back.mes_key).toBe(entity.mesKey);
    expect(back.fecha_pago).toBe(entity.fechaPago);
    expect(back.created_at).toBe(entity.createdAt);
    expect(back.updated_at).toBe(entity.updatedAt);
  });

  it('round-trip: toRow(fromRow(row)) === row', () => {
    expect(mensualidadToRow(mensualidadFromRow(row))).toEqual(row);
  });

  it('maneja campos nullable correctamente (null → null)', () => {
    const rowWithNulls: MensualidadRow = { ...row, fecha_pago: null, monto: null };
    const entity = mensualidadFromRow(rowWithNulls);
    expect(entity.fechaPago).toBeNull();
    expect(entity.monto).toBeNull();
    // round-trip
    expect(mensualidadToRow(entity)).toEqual(rowWithNulls);
  });
});

// ---- Tarifa ----

describe('tarifaFromRow / tarifaToRow', () => {
  const row: TarifaRow = {
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

  it('fromRow mapea todos los campos snake_case a camelCase correctamente', () => {
    const entity = tarifaFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.carroMes).toBe(row.carro_mes);
    expect(entity.motoMes).toBe(row.moto_mes);
    expect(entity.visHora).toBe(row.vis_hora);
    expect(entity.horasGratis).toBe(row.horas_gratis);
    expect(entity.iva).toBe(row.iva);
    expect(entity.capacidadVisitantes).toBe(row.capacidad_visitantes);
    expect(entity.horasMinRecortesia).toBe(row.horas_min_recortesia);
    expect(entity.updatedAt).toBe(row.updated_at);
  });

  it('toRow mapea todos los campos camelCase a snake_case correctamente', () => {
    const entity = tarifaFromRow(row);
    const back = tarifaToRow(entity);
    expect(back.carro_mes).toBe(entity.carroMes);
    expect(back.moto_mes).toBe(entity.motoMes);
    expect(back.vis_hora).toBe(entity.visHora);
    expect(back.horas_gratis).toBe(entity.horasGratis);
    expect(back.capacidad_visitantes).toBe(entity.capacidadVisitantes);
    expect(back.horas_min_recortesia).toBe(entity.horasMinRecortesia);
    expect(back.updated_at).toBe(entity.updatedAt);
  });

  it('round-trip: toRow(fromRow(row)) === row', () => {
    expect(tarifaToRow(tarifaFromRow(row))).toEqual(row);
  });

  it('maneja campos nullable correctamente (null → null)', () => {
    // Tarifa has no nullable fields, but verify basic values are preserved
    const entity = tarifaFromRow(row);
    expect(entity.carroMes).toBe(20000);
    expect(entity.motoMes).toBe(10000);
  });
});

// ---- Actividad ----

describe('actividadFromRow / actividadToRow', () => {
  const row: ActividadRow = {
    id: 'act-1',
    msg: 'Ingresó vehículo ABC123',
    ts: '2024-06-01T10:00:00.000Z',
    tipo: 'ingreso',
  };

  it('fromRow mapea todos los campos correctamente', () => {
    const entity = actividadFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.msg).toBe(row.msg);
    expect(entity.ts).toBe(row.ts);
    expect(entity.tipo).toBe(row.tipo);
  });

  it('toRow mapea todos los campos correctamente', () => {
    const entity = actividadFromRow(row);
    const back = actividadToRow(entity);
    expect(back.id).toBe(entity.id);
    expect(back.msg).toBe(entity.msg);
    expect(back.ts).toBe(entity.ts);
    expect(back.tipo).toBe(entity.tipo);
  });

  it('round-trip: toRow(fromRow(row)) === row', () => {
    expect(actividadToRow(actividadFromRow(row))).toEqual(row);
  });

  it('maneja campos nullable correctamente (null → null)', () => {
    // Actividad has no nullable fields, verify different tipo values work
    const rowSalida: ActividadRow = { ...row, id: 'act-2', tipo: 'salida' };
    const entity = actividadFromRow(rowSalida);
    expect(entity.tipo).toBe('salida');
    expect(actividadToRow(entity)).toEqual(rowSalida);
  });
});

// ---- CierreCaja ----

describe('cierreCajaFromRow / cierreCajaToRow', () => {
  const row: CierreCajaRow = {
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

  it('fromRow mapea todos los campos snake_case a camelCase correctamente', () => {
    const entity = cierreCajaFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.fecha).toBe(row.fecha);
    expect(entity.fechaStr).toBe(row.fecha_str);
    expect(entity.cobrosVis).toBe(row.cobros_vis);
    expect(entity.totalVis).toBe(row.total_vis);
    expect(entity.cobrosMens).toBe(row.cobros_mens);
    expect(entity.totalMens).toBe(row.total_mens);
    expect(entity.totalIva).toBe(row.total_iva);
    expect(entity.total).toBe(row.total);
  });

  it('toRow mapea todos los campos camelCase a snake_case correctamente', () => {
    const entity = cierreCajaFromRow(row);
    const back = cierreCajaToRow(entity);
    expect(back.fecha_str).toBe(entity.fechaStr);
    expect(back.cobros_vis).toBe(entity.cobrosVis);
    expect(back.total_vis).toBe(entity.totalVis);
    expect(back.cobros_mens).toBe(entity.cobrosMens);
    expect(back.total_mens).toBe(entity.totalMens);
    expect(back.total_iva).toBe(entity.totalIva);
  });

  it('round-trip: toRow(fromRow(row)) === row', () => {
    expect(cierreCajaToRow(cierreCajaFromRow(row))).toEqual(row);
  });

  it('maneja campos nullable correctamente (null → null)', () => {
    // CierreCaja has no nullable fields, but verify zero values work
    const rowZero: CierreCajaRow = {
      ...row,
      id: 'cierre-empty',
      cobros_vis: 0,
      total_vis: 0,
      cobros_mens: 0,
      total_mens: 0,
      total_iva: 0,
      total: 0,
    };
    const entity = cierreCajaFromRow(rowZero);
    expect(entity.cobrosVis).toBe(0);
    expect(entity.totalVis).toBe(0);
    expect(cierreCajaToRow(entity)).toEqual(rowZero);
  });
});

// ---- PagoMensualidad ----

describe('pagoMensualidadFromRow / pagoMensualidadToRow', () => {
  const row: PagoMensualidadRow = {
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

  it('fromRow mapea todos los campos snake_case a camelCase correctamente', () => {
    const entity = pagoMensualidadFromRow(row);
    expect(entity.id).toBe(row.id);
    expect(entity.residenteId).toBe(row.residente_id);
    expect(entity.placa).toBe(row.placa);
    expect(entity.cod).toBe(row.cod);
    expect(entity.nombre).toBe(row.nombre);
    expect(entity.tipo).toBe(row.tipo);
    expect(entity.fecha).toBe(row.fecha);
    expect(entity.monto).toBe(row.monto);
    expect(entity.mesKey).toBe(row.mes_key);
  });

  it('toRow mapea todos los campos camelCase a snake_case correctamente', () => {
    const entity = pagoMensualidadFromRow(row);
    const back = pagoMensualidadToRow(entity);
    expect(back.residente_id).toBe(entity.residenteId);
    expect(back.mes_key).toBe(entity.mesKey);
  });

  it('round-trip: toRow(fromRow(row)) === row', () => {
    expect(pagoMensualidadToRow(pagoMensualidadFromRow(row))).toEqual(row);
  });

  it('maneja campos nullable correctamente (null → null)', () => {
    // PagoMensualidad has no nullable fields, verify moto tipo works
    const rowMoto: PagoMensualidadRow = { ...row, id: 'pago-m', tipo: 'moto', monto: 10000 };
    const entity = pagoMensualidadFromRow(rowMoto);
    expect(entity.tipo).toBe('moto');
    expect(entity.monto).toBe(10000);
    expect(pagoMensualidadToRow(entity)).toEqual(rowMoto);
  });
});
