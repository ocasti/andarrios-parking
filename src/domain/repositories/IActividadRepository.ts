import type { Actividad } from '../entities';

export interface IActividadRepository {
  registrar(a: Actividad): Promise<void>;
}
