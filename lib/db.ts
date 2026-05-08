'use client';
import Dexie, { Table } from 'dexie';
import type {
  Residente, Visitante, Mensualidad, PagoMensualidad,
  Bloqueado, PlacaAprobada, CierreCaja, Actividad, Tarifas, QueueRow,
} from './types';

class AndarriosDB extends Dexie {
  residentes!: Table<Residente, string>;
  visitantes!: Table<Visitante, string>;
  mensualidades!: Table<Mensualidad, string>;
  pagos!: Table<PagoMensualidad, string>;
  bloqueados!: Table<Bloqueado, string>;
  placas_aprobadas!: Table<PlacaAprobada, string>;
  cierres!: Table<CierreCaja, string>;
  actividad!: Table<Actividad, string>;
  tarifas!: Table<Tarifas, number>;
  queue!: Table<QueueRow, number>;
  meta!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('andarrios-db');
    this.version(1).stores({
      residentes: 'id, placa, cod, deleted_at',
      visitantes: 'id, placa, cod, salida',
      mensualidades: 'id, residente_id, mes_key, [residente_id+mes_key]',
      pagos: 'id, fecha, mes_key',
      bloqueados: 'id, cod, desbloqueado_at',
      placas_aprobadas: 'id, cod, placa, deleted_at',
      cierres: 'id, fecha_str',
      actividad: 'id, ts',
      tarifas: 'id',
      queue: '++id, ts',
      meta: 'key',
    });
  }
}

let _db: AndarriosDB | null = null;
export function db(): AndarriosDB {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB no disponible en server');
  }
  if (!_db) _db = new AndarriosDB();
  return _db;
}
