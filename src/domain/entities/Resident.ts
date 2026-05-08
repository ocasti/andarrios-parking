export type VehicleType = 'car' | 'motorcycle';

export interface Resident {
  id: string;
  aptCode: string;        // ApartmentCode string: T01-101
  tower: number;
  floor: number;
  unit: number;
  plate: string;          // normalized to uppercase
  vehicleType: VehicleType;
  name: string;
  phone: string | null;
  registrationDate: string; // ISO string
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type NewResident = Omit<Resident, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
