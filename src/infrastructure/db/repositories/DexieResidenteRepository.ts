import type { IResidenteRepository } from '../../../domain/repositories/IResidenteRepository';
import type { Residente, NuevoResidente } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { residenteFromRow, residenteToRow } from '../mappers';

export class DexieResidenteRepository implements IResidenteRepository {
  constructor(private readonly db: AndarriosDB) {}

  async crear(data: NuevoResidente & { id: string }): Promise<Residente> {
    const now = new Date().toISOString();
    const residente: Residente = {
      ...data,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await this.db.residentes.add(residenteToRow(residente));
    return residente;
  }

  async obtenerPorId(id: string): Promise<Residente | undefined> {
    const row = await this.db.residentes.get(id);
    return row ? residenteFromRow(row) : undefined;
  }

  async obtenerPorPlaca(placa: string): Promise<Residente | undefined> {
    const row = await this.db.residentes
      .where('placa')
      .equals(placa)
      .filter((r) => r.deleted_at == null)
      .first();
    return row ? residenteFromRow(row) : undefined;
  }

  async listarActivos(): Promise<Residente[]> {
    const rows = await this.db.residentes
      .filter((r) => r.deleted_at == null)
      .toArray();
    return rows.map(residenteFromRow);
  }

  async eliminar(id: string, deletedAt: string): Promise<void> {
    await this.db.residentes.update(id, {
      deleted_at: deletedAt,
      updated_at: new Date().toISOString(),
    });
  }

  async existePlaca(placa: string): Promise<boolean> {
    const count = await this.db.residentes
      .where('placa')
      .equals(placa)
      .filter((r) => r.deleted_at == null)
      .count();
    return count > 0;
  }
}
