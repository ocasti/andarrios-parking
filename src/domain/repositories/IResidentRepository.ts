import type { Resident, NewResident } from '../entities';

export interface IResidentRepository {
  create(data: NewResident & { id: string }): Promise<Resident>;
  findById(id: string): Promise<Resident | undefined>;
  findByPlate(plate: string): Promise<Resident | undefined>;
  listActive(): Promise<Resident[]>;
  softDelete(id: string, deletedAt: string): Promise<void>;
  plateExists(plate: string): Promise<boolean>;
}
