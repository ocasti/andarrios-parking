import type { DailyClose, ActivityLog } from '../../entities';

export interface PerformDailyCloseInput {
  visitorCharges: number;
  visitorTotal: number;
  monthlyCharges: number;
  monthlyTotal: number;
  totalTax: number;
}

export interface PerformDailyCloseDeps {
  dailyCloseRepo: {
    create(c: DailyClose): Promise<void>;
  };
  activityRepo: {
    log(a: ActivityLog): Promise<void>;
  };
  generateId(): string;
  now(): string;
  dateString(): string; // YYYY-MM-DD Colombia
}

export async function performDailyClose(
  input: PerformDailyCloseInput,
  deps: PerformDailyCloseDeps,
): Promise<DailyClose> {
  const total = input.visitorTotal + input.monthlyTotal;
  const nowTs = deps.now();

  const dailyClose: DailyClose = {
    id: deps.generateId(),
    closedAt: nowTs,
    dateStr: deps.dateString(),
    visitorCharges: input.visitorCharges,
    visitorTotal: input.visitorTotal,
    monthlyCharges: input.monthlyCharges,
    monthlyTotal: input.monthlyTotal,
    totalTax: input.totalTax,
    total,
  };

  await deps.dailyCloseRepo.create(dailyClose);

  await deps.activityRepo.log({
    id: deps.generateId(),
    msg: `Daily close: ${dailyClose.dateStr} — total $${total}`,
    ts: nowTs,
    category: 'daily-close',
  });

  return dailyClose;
}
