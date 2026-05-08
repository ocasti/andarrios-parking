import type { IResidentRepository } from '../../../domain/repositories/IResidentRepository';
import type { Resident, NewResident } from '../../../domain/entities';
import type { AndarriosDB } from '../AndarriosDB';
import { residentFromRow, residentToRow } from '../mappers';

export class DexieResidentRepository implements IResidentRepository {
  constructor(private readonly db: AndarriosDB) {}

  async create(data: NewResident & { id: string }): Promise<Resident> {
    const now = new Date().toISOString();
    const resident: Resident = {
      ...data,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await this.db.residentes.add(residentToRow(resident));
    return resident;
  }

  async findById(id: string): Promise<Resident | undefined> {
    const row = await this.db.residentes.get(id);
    return row ? residentFromRow(row) : undefined;
  }

  async findByPlate(plate: string): Promise<Resident | undefined> {
    const row = await this.db.residentes
      .where('placa')
      .equals(plate)
      .filter((r) => r.deleted_at == null)
      .first();
    return row ? residentFromRow(row) : undefined;
  }

  async listActive(): Promise<Resident[]> {
    const rows = await this.db.residentes
      .filter((r) => r.deleted_at == null)
      .toArray();
    return rows.map(residentFromRow);
  }

  async softDelete(id: string, deletedAt: string): Promise<void> {
    await this.db.residentes.update(id, {
      deleted_at: deletedAt,
      updated_at: new Date().toISOString(),
    });
  }

  async plateExists(plate: string): Promise<boolean> {
    const count = await this.db.residentes
      .where('placa')
      .equals(plate)
      .filter((r) => r.deleted_at == null)
      .count();
    return count > 0;
  }
}
