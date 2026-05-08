import type { Residente, Visitante, Mensualidad, Tarifa, Actividad, CierreCaja, PagoMensualidad } from '../../../../domain/entities';

let counter = 0;
const next = () => String(++counter);

export const makeResidente = (overrides: Partial<Residente> = {}): Residente => ({
  id: `res-${next()}`,
  cod: 'T01-101',
  torre: 1,
  piso: 1,
  apto: 1,
  placa: `ABC${next()}`,
  tipo: 'carro',
  nombre: 'Residente Test',
  cel: null,
  fechaRegistro: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
  ...overrides,
});

export const makeVisitante = (overrides: Partial<Visitante> = {}): Visitante => ({
  id: `vis-${next()}`,
  cod: 'T01-101',
  placa: `XYZ${next()}`,
  tipo: 'carro',
  nombre: 'Visitante Test',
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
  ...overrides,
});

export const makeMensualidad = (overrides: Partial<Mensualidad> = {}): Mensualidad => ({
  id: `mens-${next()}`,
  residenteId: `res-${next()}`,
  mesKey: '2024-06',
  estado: 'pendiente',
  fechaPago: null,
  monto: null,
  createdAt: '2024-06-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
  ...overrides,
});

export const makeTarifa = (overrides: Partial<Tarifa> = {}): Tarifa => ({
  id: 1,
  carroMes: 20000,
  motoMes: 10000,
  visHora: 1000,
  horasGratis: 2,
  iva: 19,
  capacidadVisitantes: 0,
  horasMinRecortesia: 6,
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const makeActividad = (overrides: Partial<Actividad> = {}): Actividad => ({
  id: `act-${next()}`,
  msg: 'Actividad de prueba',
  ts: new Date().toISOString(),
  tipo: 'info',
  ...overrides,
});

export const makeCierreCaja = (overrides: Partial<CierreCaja> = {}): CierreCaja => ({
  id: `cierre-${next()}`,
  fecha: '2024-06-01T23:59:00.000Z',
  fechaStr: '2024-06-01',
  cobrosVis: 3,
  totalVis: 9000,
  cobrosMens: 10,
  totalMens: 200000,
  totalIva: 1710,
  total: 210710,
  ...overrides,
});

export const makePagoMensualidad = (overrides: Partial<PagoMensualidad> = {}): PagoMensualidad => ({
  id: `pago-${next()}`,
  residenteId: `res-${next()}`,
  placa: `DEF${next()}`,
  cod: 'T01-101',
  nombre: 'Residente Test',
  tipo: 'carro',
  fecha: '2024-06-15T10:00:00.000Z',
  monto: 20000,
  mesKey: '2024-06',
  ...overrides,
});
