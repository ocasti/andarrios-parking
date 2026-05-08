import type { Resident, MonthlyFee, MonthlyPayment, ActivityLog } from '../../entities';

export interface MarkAsPaidInput {
  residentId: string;
  rates: {
    carAmount: number;
    motorcycleAmount: number;
  };
  monthKey: string;
}

export interface MarkAsPaidDeps {
  residentRepo: {
    findById(id: string): Promise<Resident | undefined>;
  };
  monthlyFeeRepo: {
    findByResidentAndMonth(rid: string, mk: string): Promise<MonthlyFee | undefined>;
    create(m: MonthlyFee): Promise<MonthlyFee>;
    update(id: string, updates: Partial<MonthlyFee>): Promise<void>;
  };
  paymentRepo: {
    create(p: MonthlyPayment): Promise<void>;
  };
  activityRepo: {
    log(a: ActivityLog): Promise<void>;
  };
  generateId(): string;
  now(): string;
}

export async function markAsPaid(
  input: MarkAsPaidInput,
  deps: MarkAsPaidDeps,
): Promise<void> {
  const resident = await deps.residentRepo.findById(input.residentId);
  if (!resident) {
    throw new Error('Resident not found');
  }

  const amount =
    resident.vehicleType === 'car' ? input.rates.carAmount : input.rates.motorcycleAmount;

  const ts = deps.now();

  const existingMonthlyFee = await deps.monthlyFeeRepo.findByResidentAndMonth(
    input.residentId,
    input.monthKey,
  );

  if (existingMonthlyFee) {
    await deps.monthlyFeeRepo.update(existingMonthlyFee.id, {
      status: 'paid',
      paymentDate: ts,
      amount,
      updatedAt: ts,
    });
  } else {
    await deps.monthlyFeeRepo.create({
      id: deps.generateId(),
      residentId: input.residentId,
      monthKey: input.monthKey,
      status: 'paid',
      paymentDate: ts,
      amount,
      createdAt: ts,
      updatedAt: ts,
    });
  }

  await deps.paymentRepo.create({
    id: deps.generateId(),
    residentId: resident.id,
    plate: resident.plate,
    aptCode: resident.aptCode,
    name: resident.name,
    vehicleType: resident.vehicleType,
    date: ts,
    amount,
    monthKey: input.monthKey,
  });

  await deps.activityRepo.log({
    id: deps.generateId(),
    msg: `Monthly fee paid: ${resident.name} (${resident.plate}) — ${input.monthKey} $${amount}`,
    ts,
    category: 'monthly-fee',
  });
}
