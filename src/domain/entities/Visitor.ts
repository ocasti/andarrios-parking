import type { VehicleType } from './Resident';

export interface Visitor {
  id: string;
  aptCode: string;
  plate: string;
  vehicleType: VehicleType;
  name: string;
  phone: string | null;
  checkIn: string;        // ISO string
  checkOut: string | null;
  hours: number | null;
  baseAmount: number | null;  // charge before tax
  tax: number | null;
  total: number | null;
  courtesyApplies: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NewVisitor = Pick<Visitor, 'aptCode' | 'plate' | 'vehicleType' | 'name' | 'phone'>;
