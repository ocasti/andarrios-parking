import type { VehicleType } from './Resident';

export interface ApprovedPlate {
  id: string;
  aptCode: string;
  plate: string;
  vehicleType: VehicleType;
  approvedAt: string;
  deletedAt: string | null;
}
