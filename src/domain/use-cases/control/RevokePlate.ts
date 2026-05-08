import type { IApprovedPlateRepository } from '../../repositories/IApprovedPlateRepository';
import type { IActivityLogRepository } from '../../repositories/IActivityLogRepository';

interface Deps {
  approvedPlateRepo: IApprovedPlateRepository;
  activityRepo: IActivityLogRepository;
  generateId: () => string;
  now: () => string;
}

export async function revokePlate(plateId: string, deps: Deps): Promise<void> {
  const { approvedPlateRepo, activityRepo, generateId, now } = deps;
  await approvedPlateRepo.revoke(plateId, now());
  await activityRepo.log({
    id: generateId(),
    msg: `Placa revocada (id ${plateId})`,
    ts: now(),
    category: 'resident',
  });
}
