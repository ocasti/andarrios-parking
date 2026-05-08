import type { Tarifa } from '../entities';

export interface ITarifaRepository {
  obtener(): Promise<Tarifa | undefined>;
  guardar(t: Tarifa): Promise<void>;
}
