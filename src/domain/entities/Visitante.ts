import type { TipoVehiculo } from './Residente';

export interface Visitante {
  id: string;
  cod: string;
  placa: string;
  tipo: TipoVehiculo;
  nombre: string;
  tel: string | null;
  entrada: string;       // ISO string
  salida: string | null;
  horas: number | null;
  base: number | null;   // cobro sin IVA
  iva: number | null;
  total: number | null;
  cortesiaAplica: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NuevoVisitante = Pick<Visitante, 'cod' | 'placa' | 'tipo' | 'nombre' | 'tel'>;
