import type { IBlockedUnitRepository } from '../../../domain/repositories/IBlockedUnitRepository';
import type { BlockedUnit } from '../../../domain/entities/BlockedUnit';
import type { AndarriosDB } from '../AndarriosDB';
import { blockedUnitFromRow, blockedUnitToRow } from '../mappers';

export class DexieBlockedUnitRepository implements IBlockedUnitRepository {
  constructor(private readonly db: AndarriosDB) {}

  async create(data: BlockedUnit): Promise<BlockedUnit> {
    await this.db.bloqueados.add(blockedUnitToRow(data));
    return data;
  }

  async findActive(aptCode: string): Promise<BlockedUnit | undefined> {
    const row = await this.db.bloqueados
      .where('cod')
      .equals(aptCode)
      .filter((b) => b.desbloqueado_at == null)
      .first();
    return row ? blockedUnitFromRow(row) : undefined;
  }

  async unblock(aptCode: string, unblockedAt: string): Promise<void> {
    const row = await this.db.bloqueados
      .where('cod')
      .equals(aptCode)
      .filter((b) => b.desbloqueado_at == null)
      .first();
    if (row) {
      await this.db.bloqueados.update(row.id, { desbloqueado_at: unblockedAt });
    }
  }

  async listActive(): Promise<BlockedUnit[]> {
    const rows = await this.db.bloqueados
      .filter((b) => b.desbloqueado_at == null)
      .toArray();
    return rows.map(blockedUnitFromRow);
  }
}
