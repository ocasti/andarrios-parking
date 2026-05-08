import type { Residente, NuevoResidente } from '../entities';

export interface IResidenteRepository {
  crear(data: NuevoResidente & { id: string }): Promise<Residente>;
  obtenerPorId(id: string): Promise<Residente | undefined>;
  obtenerPorPlaca(placa: string): Promise<Residente | undefined>;
  listarActivos(): Promise<Residente[]>;
  eliminar(id: string, deletedAt: string): Promise<void>;
  existePlaca(placa: string): Promise<boolean>;
}
