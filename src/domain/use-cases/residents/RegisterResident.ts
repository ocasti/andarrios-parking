import type { Resident, NewResident, MonthlyFee, ActivityLog } from '../../entities';

export interface RegisterResidentInput {
  aptCode: string;
  tower: number;
  floor: number;
  unit: number;
  plate: string;
  vehicleType: Resident['vehicleType'];
  name: string;
  phone: string | null;
}

export interface RegisterResidentDeps {
  residentRepo: {
    create(r: NewResident & { id: string }): Promise<Resident>;
    plateExists(p: string): Promise<boolean>;
  };
  monthlyFeeRepo: {
    create(m: MonthlyFee): Promise<MonthlyFee>;
  };
  activityRepo: {
    log(a: ActivityLog): Promise<void>;
  };
  generateId(): string;
  now(): string;
  currentMonthKey(): string;
}

export async function registerResident(
  input: RegisterResidentInput,
  deps: RegisterResidentDeps,
): Promise<Resident> {
  const plateAlreadyExists = await deps.residentRepo.plateExists(input.plate);
  if (plateAlreadyExists) {
    throw new Error('License plate already registered');
  }

  const ts = deps.now();
  const id = deps.generateId();

  const resident = await deps.residentRepo.create({
    id,
    aptCode: input.aptCode,
    tower: input.tower,
    floor: input.floor,
    unit: input.unit,
    plate: input.plate,
    vehicleType: input.vehicleType,
    name: input.name,
    phone: input.phone,
    registrationDate: ts,
  });

  const monthKey = deps.currentMonthKey();
  await deps.monthlyFeeRepo.create({
    id: deps.generateId(),
    residentId: id,
    monthKey,
    status: 'pending',
    paymentDate: null,
    amount: null,
    createdAt: ts,
    updatedAt: ts,
  });

  await deps.activityRepo.log({
    id: deps.generateId(),
    msg: `Resident registered: ${input.name} (${input.plate})`,
    ts,
    category: 'resident',
  });

  return resident;
}
