'use client';
import { getDB } from '@/src/infrastructure/db/AndarriosDB';
import { SyncActivityLogRepository } from '@/src/infrastructure/db/repositories/SyncActivityLogRepository';
import { SyncApprovedPlateRepository } from '@/src/infrastructure/db/repositories/SyncApprovedPlateRepository';
import { SyncBlockedUnitRepository } from '@/src/infrastructure/db/repositories/SyncBlockedUnitRepository';
import { SyncDailyCloseRepository } from '@/src/infrastructure/db/repositories/SyncDailyCloseRepository';
import { SyncMonthlyFeeRepository } from '@/src/infrastructure/db/repositories/SyncMonthlyFeeRepository';
import { SyncMonthlyPaymentRepository } from '@/src/infrastructure/db/repositories/SyncMonthlyPaymentRepository';
import { SyncPricingRepository } from '@/src/infrastructure/db/repositories/SyncPricingRepository';
import { SyncResidentRepository } from '@/src/infrastructure/db/repositories/SyncResidentRepository';
import { SyncVisitorRepository } from '@/src/infrastructure/db/repositories/SyncVisitorRepository';
import { checkInVisitor } from '@/src/domain/use-cases/visitors/CheckInVisitor';
import { checkOutVisitor } from '@/src/domain/use-cases/visitors/CheckOutVisitor';
import { registerResident } from '@/src/domain/use-cases/residents/RegisterResident';
import { removeResident } from '@/src/domain/use-cases/residents/RemoveResident';
import { markAsPaid } from '@/src/domain/use-cases/monthly-fees/MarkAsPaid';
import { performDailyClose } from '@/src/domain/use-cases/daily-close/PerformDailyClose';
import { updatePricing } from '@/src/domain/use-cases/pricing/UpdatePricing';
import { blockUnit } from '@/src/domain/use-cases/control/BlockUnit';
import { unblockUnit } from '@/src/domain/use-cases/control/UnblockUnit';
import { approvePlate } from '@/src/domain/use-cases/control/ApprovePlate';
import { revokePlate } from '@/src/domain/use-cases/control/RevokePlate';
import { colombiaDateStr } from '@/src/domain/services/FormatterService';
import type { CheckInVisitorInput, CheckInVisitorOutput } from '@/src/domain/use-cases/visitors/CheckInVisitor';
import type { CheckOutVisitorInput, CheckOutVisitorOutput } from '@/src/domain/use-cases/visitors/CheckOutVisitor';
import type { RegisterResidentInput } from '@/src/domain/use-cases/residents/RegisterResident';
import type { MarkAsPaidInput } from '@/src/domain/use-cases/monthly-fees/MarkAsPaid';
import type { PerformDailyCloseInput } from '@/src/domain/use-cases/daily-close/PerformDailyClose';
import type { BlockUnitInput } from '@/src/domain/use-cases/control/BlockUnit';
import type { ApprovePlateInput } from '@/src/domain/use-cases/control/ApprovePlate';
import type { DailyClose, PricingConfig, Resident, BlockedUnit, ApprovedPlate } from '@/src/domain/entities';

const uuid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();
const currentMonthKey = () => colombiaDateStr(new Date()).slice(0, 7);

function makeRepos() {
  const database = getDB();
  return {
    visitorRepo: new SyncVisitorRepository(database),
    residentRepo: new SyncResidentRepository(database),
    monthlyFeeRepo: new SyncMonthlyFeeRepository(database),
    paymentRepo: new SyncMonthlyPaymentRepository(database),
    dailyCloseRepo: new SyncDailyCloseRepository(database),
    activityRepo: new SyncActivityLogRepository(database),
    pricingRepo: new SyncPricingRepository(database),
    blockedUnitRepo: new SyncBlockedUnitRepository(database),
    approvedPlateRepo: new SyncApprovedPlateRepository(database),
  };
}

export async function doCheckInVisitor(input: CheckInVisitorInput): Promise<CheckInVisitorOutput> {
  const { visitorRepo, activityRepo } = makeRepos();
  return checkInVisitor(input, { visitorRepo, activityRepo, generateId: uuid, now: nowIso });
}

export async function doCheckOutVisitor(input: CheckOutVisitorInput): Promise<CheckOutVisitorOutput> {
  const { visitorRepo, activityRepo } = makeRepos();
  return checkOutVisitor(input, { visitorRepo, activityRepo, now: nowIso });
}

export async function doRegisterResident(input: RegisterResidentInput): Promise<Resident> {
  const { residentRepo, monthlyFeeRepo, activityRepo } = makeRepos();
  return registerResident(input, {
    residentRepo,
    monthlyFeeRepo,
    activityRepo,
    generateId: uuid,
    now: nowIso,
    currentMonthKey,
  });
}

export async function doRemoveResident(id: string): Promise<void> {
  const { residentRepo, activityRepo } = makeRepos();
  return removeResident(id, { residentRepo, activityRepo, now: nowIso });
}

export async function doMarkAsPaid(input: MarkAsPaidInput): Promise<void> {
  const { residentRepo, monthlyFeeRepo, paymentRepo, activityRepo } = makeRepos();
  return markAsPaid(input, {
    residentRepo,
    monthlyFeeRepo,
    paymentRepo,
    activityRepo,
    generateId: uuid,
    now: nowIso,
  });
}

export async function doPerformDailyClose(input: PerformDailyCloseInput): Promise<DailyClose> {
  const { dailyCloseRepo, activityRepo } = makeRepos();
  return performDailyClose(input, {
    dailyCloseRepo,
    activityRepo,
    generateId: uuid,
    now: nowIso,
    dateString: () => colombiaDateStr(new Date()),
  });
}

export async function doUpdatePricing(
  updates: Partial<Omit<PricingConfig, 'id' | 'updatedAt'>>,
  current: PricingConfig,
): Promise<PricingConfig> {
  const { pricingRepo, activityRepo } = makeRepos();
  return updatePricing(updates, current, { pricingRepo, activityRepo, now: nowIso });
}

export async function doBlockUnit(input: BlockUnitInput): Promise<BlockedUnit | null> {
  const { blockedUnitRepo, activityRepo } = makeRepos();
  return blockUnit(input, { blockedUnitRepo, activityRepo, generateId: uuid, now: nowIso });
}

export async function doUnblockUnit(aptCode: string): Promise<void> {
  const { blockedUnitRepo, activityRepo } = makeRepos();
  return unblockUnit(aptCode, { blockedUnitRepo, activityRepo, generateId: uuid, now: nowIso });
}

export async function doApprovePlate(input: ApprovePlateInput): Promise<ApprovedPlate | null> {
  const { approvedPlateRepo, activityRepo } = makeRepos();
  return approvePlate(input, { approvedPlateRepo, activityRepo, generateId: uuid, now: nowIso });
}

export async function doRevokePlate(plateId: string): Promise<void> {
  const { approvedPlateRepo, activityRepo } = makeRepos();
  return revokePlate(plateId, { approvedPlateRepo, activityRepo, generateId: uuid, now: nowIso });
}
