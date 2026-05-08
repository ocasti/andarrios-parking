import type { Mensualidad } from '../entities';

export interface IMensualidadRepository {
  crear(m: Mensualidad): Promise<Mensualidad>;
  obtenerPorResidenteYMes(residenteId: string, mesKey: string): Promise<Mensualidad | undefined>;
  actualizar(id: string, datos: Partial<Mensualidad>): Promise<void>;
  upsert(m: Mensualidad): Promise<void>;
}
