import { describe, it, expect } from 'vitest';
import { TARIFA_DEFAULTS } from '../Tarifa';
import type {
  TipoVehiculo,
  Residente,
  NuevoResidente,
} from '../Residente';
import type { Visitante, NuevoVisitante } from '../Visitante';
import type { Mensualidad, EstadoMensualidad } from '../Mensualidad';
import type { Tarifa } from '../Tarifa';
import type { Bloqueado } from '../Bloqueado';
import type { CierreCaja } from '../CierreCaja';
import type { Actividad } from '../Actividad';
import type { PagoMensualidad } from '../PagoMensualidad';

// ---------------------------------------------------------------------------
// TARIFA_DEFAULTS — única constante en runtime del módulo de entidades
// ---------------------------------------------------------------------------
describe('TARIFA_DEFAULTS', () => {
  it('tiene valores por defecto correctos', () => {
    expect(TARIFA_DEFAULTS.carroMes).toBe(20000);
    expect(TARIFA_DEFAULTS.motoMes).toBe(10000);
    expect(TARIFA_DEFAULTS.visHora).toBe(1000);
    expect(TARIFA_DEFAULTS.horasGratis).toBe(2);
    expect(TARIFA_DEFAULTS.iva).toBe(19);
    expect(TARIFA_DEFAULTS.capacidadVisitantes).toBe(0);
    expect(TARIFA_DEFAULTS.horasMinRecortesia).toBe(6);
  });

  it('no incluye id ni updatedAt (Omit<Tarifa, "id" | "updatedAt">)', () => {
    expect('id' in TARIFA_DEFAULTS).toBe(false);
    expect('updatedAt' in TARIFA_DEFAULTS).toBe(false);
  });

  it('tiene exactamente 7 propiedades', () => {
    expect(Object.keys(TARIFA_DEFAULTS)).toHaveLength(7);
  });
});

// ---------------------------------------------------------------------------
// Comprobaciones de forma (shape checks) sobre objetos literales tipados
// ---------------------------------------------------------------------------
describe('Residente — shape', () => {
  it('acepta un objeto con todos los campos requeridos', () => {
    const r: Residente = {
      id: 'uuid-1',
      cod: 'T01-101',
      torre: 1,
      piso: 1,
      apto: 1,
      placa: 'ABC123',
      tipo: 'carro',
      nombre: 'Juan',
      cel: null,
      fechaRegistro: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      deletedAt: null,
    };
    expect(r.id).toBe('uuid-1');
    expect(r.tipo).toBe('carro');
  });

  it('NuevoResidente no tiene id, createdAt, updatedAt, deletedAt', () => {
    const nuevo: NuevoResidente = {
      cod: 'T01-101',
      torre: 1,
      piso: 1,
      apto: 1,
      placa: 'ABC123',
      tipo: 'moto',
      nombre: 'Ana',
      cel: '+573001234567',
      fechaRegistro: '2024-01-01T00:00:00.000Z',
    };
    expect(nuevo.placa).toBe('ABC123');
    // type-level: el compilador rechazaría añadir id / createdAt / etc.
  });
});

describe('TipoVehiculo — valores de unión', () => {
  it('acepta "carro"', () => {
    const t: TipoVehiculo = 'carro';
    expect(t).toBe('carro');
  });

  it('acepta "moto"', () => {
    const t: TipoVehiculo = 'moto';
    expect(t).toBe('moto');
  });
});

describe('EstadoMensualidad — valores de unión', () => {
  it('acepta "pendiente"', () => {
    const e: EstadoMensualidad = 'pendiente';
    expect(e).toBe('pendiente');
  });

  it('acepta "pagado"', () => {
    const e: EstadoMensualidad = 'pagado';
    expect(e).toBe('pagado');
  });
});

describe('Visitante — shape', () => {
  it('acepta visitante con salida nula (en parqueadero)', () => {
    const v: Visitante = {
      id: 'v-1',
      cod: 'T02-201',
      placa: 'XYZ789',
      tipo: 'carro',
      nombre: 'Pedro',
      tel: null,
      entrada: '2024-06-01T10:00:00.000Z',
      salida: null,
      horas: null,
      base: null,
      iva: null,
      total: null,
      cortesiaAplica: false,
      createdAt: '2024-06-01T10:00:00.000Z',
      updatedAt: '2024-06-01T10:00:00.000Z',
    };
    expect(v.salida).toBeNull();
    expect(v.cortesiaAplica).toBe(false);
  });

  it('NuevoVisitante solo tiene los 5 campos de registro de entrada', () => {
    const nv: NuevoVisitante = {
      cod: 'T01-101',
      placa: 'ABC123',
      tipo: 'moto',
      nombre: 'Laura',
      tel: null,
    };
    expect(Object.keys(nv)).toHaveLength(5);
  });
});

describe('Mensualidad — shape', () => {
  it('acepta mensualidad pendiente sin fecha de pago', () => {
    const m: Mensualidad = {
      id: 'm-1',
      residenteId: 'r-1',
      mesKey: '2024-06',
      estado: 'pendiente',
      fechaPago: null,
      monto: null,
      createdAt: '2024-06-01T00:00:00.000Z',
      updatedAt: '2024-06-01T00:00:00.000Z',
    };
    expect(m.estado).toBe('pendiente');
    expect(m.fechaPago).toBeNull();
  });
});

describe('Bloqueado — shape', () => {
  it('acepta bloqueo activo con desbloqueadoAt nulo', () => {
    const b: Bloqueado = {
      id: 'bl-1',
      cod: 'T03-301',
      motivo: 'Mora',
      fechaBloqueo: '2024-05-01',
      desbloqueadoAt: null,
    };
    expect(b.desbloqueadoAt).toBeNull();
  });
});

describe('CierreCaja — shape', () => {
  it('acepta un cierre con todos los campos numéricos', () => {
    const c: CierreCaja = {
      id: 'cc-1',
      fecha: '2024-06-30T23:59:59.000Z',
      fechaStr: '2024-06-30',
      cobrosVis: 5,
      totalVis: 15000,
      cobrosMens: 10,
      totalMens: 200000,
      totalIva: 2850,
      total: 217850,
    };
    expect(c.total).toBe(217850);
  });
});

describe('Actividad — shape', () => {
  it('acepta actividad con tipo string', () => {
    const a: Actividad = {
      id: 'act-1',
      msg: 'Entrada registrada',
      ts: '2024-06-01T10:00:00.000Z',
      tipo: 'entrada',
    };
    expect(a.tipo).toBe('entrada');
  });
});

describe('PagoMensualidad — shape', () => {
  it('acepta pago con todos los campos', () => {
    const p: PagoMensualidad = {
      id: 'pm-1',
      residenteId: 'r-1',
      placa: 'ABC123',
      cod: 'T01-101',
      nombre: 'Juan',
      tipo: 'carro',
      fecha: '2024-06-15T12:00:00.000Z',
      monto: 20000,
      mesKey: '2024-06',
    };
    expect(p.monto).toBe(20000);
    expect(p.tipo).toBe('carro');
  });
});

describe('Tarifa — shape', () => {
  it('acepta una tarifa completa', () => {
    const t: Tarifa = {
      id: 1,
      ...TARIFA_DEFAULTS,
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    expect(t.id).toBe(1);
    expect(t.carroMes).toBe(TARIFA_DEFAULTS.carroMes);
  });
});
