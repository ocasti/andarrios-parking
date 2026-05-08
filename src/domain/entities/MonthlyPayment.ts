import type { VehicleType } from './Resident';

export interface MonthlyPayment {
  id: string;
  residentId: string;
  plate: string;
  aptCode: string;
  name: string;
  vehicleType: VehicleType;
  date: string;
  amount: number;
  monthKey: string;
}
