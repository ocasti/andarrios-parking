import { enqueue } from '@/lib/sync';
import { DexieBlockedUnitRepository } from './DexieBlockedUnitRepository';
import type { BlockedUnit } from '../../../domain/entities/BlockedUnit';
import { blockedUnitToRow } from '../mappers';

export class SyncBlockedUnitRepository extends DexieBlockedUnitRepository {
  override async create(data: BlockedUnit): Promise<BlockedUnit> {
    const result = await super.create(data);
    await enqueue({ table: 'bloqueados', op: 'insert', payload: blockedUnitToRow(result) });
    return result;
  }

  override async unblock(aptCode: string, unblockedAt: string): Promise<void> {
    const existing = await this.findActive(aptCode);
    await super.unblock(aptCode, unblockedAt);
    if (existing) {
      await enqueue({ table: 'bloqueados', op: 'update', where: { id: existing.id }, payload: { desbloqueado_at: unblockedAt } });
    }
  }
}
