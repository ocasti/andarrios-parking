import type { ApprovedPlate } from '../../entities/ApprovedPlate';
import type { VehicleType } from '../../entities/Resident';
import type { IApprovedPlateRepository } from '../../repositories/IApprovedPlateRepository';
import type { IActivityLogRepository } from '../../repositories/IActivityLogRepository';

export interface ApprovePlateInput {
  aptCode: string;
  plate: string;
  vehicleType: VehicleType;
}

interface Deps {
  approvedPlateRepo: IApprovedPlateRepository;
  activityRepo: IActivityLogRepository;
  generateId: () => string;
  now: () => string;
}

export async function approvePlate(input: ApprovePlateInput, deps: Deps): Promise<ApprovedPlate | null> {
  const { approvedPlateRepo, activityRepo, generateId, now } = deps;

  const existing = await approvedPlateRepo.findByAptAndPlate(input.aptCode, input.plate);
  if (existing) return null;

  const approved: ApprovedPlate = {
    id: generateId(),
    aptCode: input.aptCode,
    plate: input.plate,
    vehicleType: input.vehicleType,
    approvedAt: now(),
    deletedAt: null,
  };

  await approvedPlateRepo.create(approved);
  await activityRepo.log({
    id: generateId(),
    msg: `Placa aprobada: ${approved.plate} → ${approved.aptCode}`,
    ts: now(),
    category: 'resident',
  });

  return approved;
}
