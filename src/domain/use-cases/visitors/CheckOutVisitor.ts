import type { Visitor, ActivityLog } from '../../entities';
import type { IVisitorRepository } from '../../repositories/IVisitorRepository';
import type { IActivityLogRepository } from '../../repositories/IActivityLogRepository';
import { calculateCharge } from '../../services/CobroService';

export interface CheckOutVisitorInput {
  visitorId: string;
  hourlyRate: number;
  freeHours: number;
  taxRate: number;
}

export interface CheckOutVisitorOutput {
  visitor: Visitor;
  hours: number;
  baseAmount: number;
  tax: number;
  total: number;
  chargedHours: number;
  courtesyApplied: boolean;
}

export interface CheckOutVisitorDeps {
  visitorRepo: IVisitorRepository;
  activityRepo: IActivityLogRepository;
  now(): string;
}

export async function checkOutVisitor(
  input: CheckOutVisitorInput,
  deps: CheckOutVisitorDeps,
): Promise<CheckOutVisitorOutput> {
  const v = await deps.visitorRepo.findById(input.visitorId);
  if (!v) throw new Error('Visitor not found');

  const ts = deps.now();
  // Round to 4 decimal places to avoid float drift inflating ceil
  const hours = Math.max(
    0,
    Math.round(((new Date(ts).getTime() - new Date(v.checkIn).getTime()) / 3_600_000) * 10_000) / 10_000,
  );

  const charge = calculateCharge({
    hours,
    hourlyRate: input.hourlyRate,
    freeHours: input.freeHours,
    taxRate: input.taxRate,
    courtesyApplies: v.courtesyApplies,
  });

  const updates: Partial<Visitor> = {
    checkOut: ts,
    hours,
    baseAmount: charge.base,
    tax: charge.iva,
    total: charge.total,
    updatedAt: ts,
  };

  await deps.visitorRepo.recordCheckOut(v.id, updates);

  const suffix = v.courtesyApplies ? '' : ' (no courtesy)';
  const activity: ActivityLog = {
    id: `${v.id}-checkout`,
    msg: `Check-out: ${v.plate} · Charged: $${charge.total.toLocaleString('es-CO')}${suffix}`,
    ts,
    category: 'visitor',
  };
  await deps.activityRepo.log(activity);

  return {
    visitor: { ...v, ...updates } as Visitor,
    hours,
    baseAmount: charge.base,
    tax: charge.iva,
    total: charge.total,
    chargedHours: charge.chargedHours,
    courtesyApplied: v.courtesyApplies,
  };
}
