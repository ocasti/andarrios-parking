import type { IApprovedPlateRepository } from '../../../domain/repositories/IApprovedPlateRepository';
import type { ApprovedPlate } from '../../../domain/entities/ApprovedPlate';
import type { AndarriosDB } from '../AndarriosDB';
import { approvedPlateFromRow, approvedPlateToRow } from '../mappers';

export class DexieApprovedPlateRepository implements IApprovedPlateRepository {
  constructor(private readonly db: AndarriosDB) {}

  async create(data: ApprovedPlate): Promise<ApprovedPlate> {
    await this.db.placas_aprobadas.add(approvedPlateToRow(data));
    return data;
  }

  async findByAptAndPlate(aptCode: string, plate: string): Promise<ApprovedPlate | undefined> {
    const row = await this.db.placas_aprobadas
      .where('placa')
      .equals(plate)
      .filter((p) => p.cod === aptCode && p.deleted_at == null)
      .first();
    return row ? approvedPlateFromRow(row) : undefined;
  }

  async revoke(plateId: string, deletedAt: string): Promise<void> {
    await this.db.placas_aprobadas.update(plateId, { deleted_at: deletedAt });
  }

  async listActive(): Promise<ApprovedPlate[]> {
    const rows = await this.db.placas_aprobadas
      .filter((p) => p.deleted_at == null)
      .toArray();
    return rows.map(approvedPlateFromRow);
  }
}
