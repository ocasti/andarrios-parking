export type Tipo = 'carro' | 'moto';

export interface Tarifas {
  id: number;
  carro_mes: number;
  moto_mes: number;
  vis_hora: number;
  horas_gratis: number;
  iva: number;
  capacidad_visitantes: number; // 0 = sin límite
  horas_min_recortesia: number; // si reingresa antes de N h, no aplica cortesía
  updated_at?: string;
}

export interface Residente {
  id: string;
  client_id?: string;
  cod: string;
  torre: number;
  piso: number;
  apto: number;
  placa: string;
  tipo: Tipo;
  nombre: string;
  cel?: string | null;
  fecha_registro?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Visitante {
  id: string;
  client_id?: string;
  cod: string;
  placa: string;
  tipo: Tipo;
  nombre?: string | null;
  tel?: string | null;
  entrada: string;
  salida?: string | null;
  horas?: number | null;
  base?: number | null;
  iva?: number | null;
  total?: number | null;
  cortesia_aplica?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Mensualidad {
  id: string;
  client_id?: string;
  residente_id: string;
  mes_key: string;
  estado: 'pendiente' | 'pagado';
  fecha_pago?: string | null;
  monto?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PagoMensualidad {
  id: string;
  client_id?: string;
  residente_id?: string | null;
  placa?: string | null;
  cod?: string | null;
  nombre?: string | null;
  tipo?: Tipo | null;
  fecha: string;
  monto: number;
  mes_key: string;
}

export interface Bloqueado {
  id: string;
  client_id?: string;
  cod: string;
  motivo: string;
  fecha_bloqueo: string;
  desbloqueado_at?: string | null;
}

export interface PlacaAprobada {
  id: string;
  client_id?: string;
  cod: string;
  placa: string;
  tipo: Tipo;
  fecha_aprobacion: string;
  deleted_at?: string | null;
}

export interface CierreCaja {
  id: string;
  client_id?: string;
  fecha: string;
  fecha_str: string;
  cobros_vis: number;
  total_vis: number;
  cobros_mens: number;
  total_mens: number;
  total_iva: number;
  total: number;
}

export interface Actividad {
  id: string;
  client_id?: string;
  msg: string;
  ts: string;
  tipo?: string;
}

export type SyncOp =
  | { table: 'residentes' | 'visitantes' | 'mensualidades' | 'pagos_mensualidades' | 'bloqueados' | 'placas_aprobadas' | 'cierres_caja' | 'actividad' | 'tarifas';
      op: 'insert' | 'update' | 'upsert' | 'delete';
      payload: Record<string, any>;
      where?: Record<string, any>;
    };

export interface QueueRow {
  id?: number;
  ts: number;
  op: SyncOp;
  attempts: number;
  lastError?: string;
}
