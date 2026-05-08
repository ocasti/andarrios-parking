import type { ApprovedPlate } from '../entities/ApprovedPlate';

export interface IApprovedPlateRepository {
  create(data: ApprovedPlate): Promise<ApprovedPlate>;
  findByAptAndPlate(aptCode: string, plate: string): Promise<ApprovedPlate | undefined>;
  revoke(plateId: string, deletedAt: string): Promise<void>;
  listActive(): Promise<ApprovedPlate[]>;
}
