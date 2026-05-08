import type { IBlockedUnitRepository } from '../../repositories/IBlockedUnitRepository';
import type { IActivityLogRepository } from '../../repositories/IActivityLogRepository';

interface Deps {
  blockedUnitRepo: IBlockedUnitRepository;
  activityRepo: IActivityLogRepository;
  generateId: () => string;
  now: () => string;
}

export async function unblockUnit(aptCode: string, deps: Deps): Promise<void> {
  const { blockedUnitRepo, activityRepo, generateId, now } = deps;

  const existing = await blockedUnitRepo.findActive(aptCode);
  if (!existing) return;

  await blockedUnitRepo.unblock(aptCode, now());
  await activityRepo.log({
    id: generateId(),
    msg: `Apto desbloqueado: ${aptCode}`,
    ts: now(),
    category: 'resident',
  });
}
