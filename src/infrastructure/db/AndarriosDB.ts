import Dexie, { type Table } from 'dexie';

// Tipos de fila en DB (snake_case para compatibilidad con Supabase)
export interface ResidentRow {
  id: string;
  cod: string;
  torre: number;
  piso: number;
  apto: number;
  placa: string;
  tipo: string;
  nombre: string;
  cel: string | null;
  fecha_registro: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface VisitorRow {
  id: string;
  cod: string;
  placa: string;
  tipo: string;
  nombre: string;
  tel: string | null;
  entrada: string;
  salida: string | null;
  horas: number | null;
  base: number | null;
  iva: number | null;
  total: number | null;
  cortesia_aplica: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthlyFeeRow {
  id: string;
  residente_id: string;
  mes_key: string;
  estado: string;
  fecha_pago: string | null;
  monto: number | null;
  created_at: string;
  updated_at: string;
}

export interface PricingRow {
  id: number;
  carro_mes: number;
  moto_mes: number;
  vis_hora: number;
  horas_gratis: number;
  iva: number;
  capacidad_visitantes: number;
  horas_min_recortesia: number;
  updated_at: string;
}

export interface ActivityLogRow {
  id: string;
  msg: string;
  ts: string;
  tipo: string;
}

export interface DailyCloseRow {
  id: string;
  fecha: string;
  fecha_str: string;
  cobros_vis: number;
  total_vis: number;
  cobros_mens: number;
  total_mens: number;
  total_iva: number;
  total: number;
}

export interface MonthlyPaymentRow {
  id: string;
  residente_id: string;
  placa: string;
  cod: string;
  nombre: string;
  tipo: string;
  fecha: string;
  monto: number;
  mes_key: string;
}

export interface QueueRow {
  id?: number;
  ts: number;
  op: Record<string, unknown>;
  attempts: number;
  lastError?: string;
}

export class AndarriosDB extends Dexie {
  residentes!: Table<ResidentRow, string>;
  visitantes!: Table<VisitorRow, string>;
  mensualidades!: Table<MonthlyFeeRow, string>;
  pagos!: Table<MonthlyPaymentRow, string>;
  cierres!: Table<DailyCloseRow, string>;
  actividad!: Table<ActivityLogRow, string>;
  tarifas!: Table<PricingRow, number>;
  queue!: Table<QueueRow, number>;
  meta!: Table<{ key: string; value: unknown }, string>;

  constructor(name = 'andarrios-db') {
    super(name);
    this.version(1).stores({
      residentes: 'id, placa, cod, deleted_at',
      visitantes: 'id, placa, cod, salida',
      mensualidades: 'id, residente_id, mes_key, [residente_id+mes_key]',
      pagos: 'id, fecha, mes_key',
      cierres: 'id, fecha_str',
      actividad: 'id, ts',
      tarifas: 'id',
      queue: '++id, ts',
      meta: 'key',
    });
  }
}

let _db: AndarriosDB | null = null;

export function getDB(name?: string): AndarriosDB {
  if (typeof window === 'undefined' && !name) {
    throw new Error('IndexedDB no disponible en server');
  }
  if (!_db) _db = new AndarriosDB(name);
  return _db;
}

export function resetDB(): void {
  _db = null;
}
