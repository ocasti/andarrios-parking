import type { BlockedUnit } from '../../entities/BlockedUnit';
import type { IBlockedUnitRepository } from '../../repositories/IBlockedUnitRepository';
import type { IActivityLogRepository } from '../../repositories/IActivityLogRepository';

export interface BlockUnitInput {
  aptCode: string;
  reason: string;
}

interface Deps {
  blockedUnitRepo: IBlockedUnitRepository;
  activityRepo: IActivityLogRepository;
  generateId: () => string;
  now: () => string;
}

export async function blockUnit(input: BlockUnitInput, deps: Deps): Promise<BlockedUnit | null> {
  const { blockedUnitRepo, activityRepo, generateId, now } = deps;

  const existing = await blockedUnitRepo.findActive(input.aptCode);
  if (existing) return null;

  const unit: BlockedUnit = {
    id: generateId(),
    aptCode: input.aptCode,
    reason: input.reason || 'Mora de mensualidad',
    blockedAt: now(),
    unblockedAt: null,
  };

  await blockedUnitRepo.create(unit);
  await activityRepo.log({
    id: generateId(),
    msg: `Apto bloqueado: ${unit.aptCode} — ${unit.reason}`,
    ts: now(),
    category: 'resident',
  });

  return unit;
}
