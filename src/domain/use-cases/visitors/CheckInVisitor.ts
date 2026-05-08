import type { Visitor, ActivityLog } from '../../entities';
import type { IVisitorRepository } from '../../repositories/IVisitorRepository';
import type { IActivityLogRepository } from '../../repositories/IActivityLogRepository';
import { evaluateCourtesy } from '../../services/CortesiaService';

export interface CheckInVisitorInput {
  aptCode: string;
  plate: string;
  vehicleType: Visitor['vehicleType'];
  name: string;
  phone: string | null;
  minHoursForCourtesy: number;
  recentHistory: Array<{ checkedOutAt: string }>;
}

export interface CheckInVisitorOutput {
  visitor: Visitor;
  courtesyApplies: boolean;
}

export interface CheckInVisitorDeps {
  visitorRepo: IVisitorRepository;
  activityRepo: IActivityLogRepository;
  generateId(): string;
  now(): string;
}

export async function checkInVisitor(
  input: CheckInVisitorInput,
  deps: CheckInVisitorDeps,
): Promise<CheckInVisitorOutput> {
  const ts = deps.now();
  const id = deps.generateId();

  const courtesyApplies = evaluateCourtesy(input.recentHistory, input.minHoursForCourtesy);

  const visitor: Visitor = {
    id,
    aptCode: input.aptCode,
    plate: input.plate,
    vehicleType: input.vehicleType,
    name: input.name,
    phone: input.phone,
    checkIn: ts,
    checkOut: null,
    hours: null,
    baseAmount: null,
    tax: null,
    total: null,
    courtesyApplies,
    createdAt: ts,
    updatedAt: ts,
  };

  const createdVisitor = await deps.visitorRepo.create(visitor);

  const suffix = courtesyApplies ? '' : ' · no courtesy (re-entry)';
  const activity: ActivityLog = {
    id: deps.generateId(),
    msg: `Visitor check-in: ${input.plate} (${input.vehicleType}) → ${input.aptCode}${suffix}`,
    ts,
    category: 'visitor',
  };
  await deps.activityRepo.log(activity);

  return { visitor: createdVisitor, courtesyApplies };
}
