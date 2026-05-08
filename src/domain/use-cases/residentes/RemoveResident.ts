import type { Resident, ActivityLog } from '../../entities';

export interface RemoveResidentDeps {
  residentRepo: {
    findById(id: string): Promise<Resident | undefined>;
    softDelete(id: string, stamp: string): Promise<void>;
  };
  activityRepo: {
    log(a: ActivityLog): Promise<void>;
  };
  now(): string;
}

export async function removeResident(
  id: string,
  deps: RemoveResidentDeps,
): Promise<void> {
  const resident = await deps.residentRepo.findById(id);
  if (!resident) {
    return;
  }

  const stamp = deps.now();
  await deps.residentRepo.softDelete(id, stamp);

  await deps.activityRepo.log({
    id: stamp + '-act',
    msg: `Resident removed: ${resident.name} (${resident.plate})`,
    ts: stamp,
    category: 'resident',
  });
}
