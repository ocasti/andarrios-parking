import { describe, it, expect, vi } from 'vitest';
import { performDailyClose } from '../PerformDailyClose';
import type { PerformDailyCloseInput, PerformDailyCloseDeps } from '../PerformDailyClose';

const NOW = '2026-03-31T18:00:00.000Z';
const DATE_STR = '2026-03-31';
const CLOSE_ID = 'close-id-1';
const ACTIVITY_ID = 'close-id-2';

const inputBase: PerformDailyCloseInput = {
  visitorCharges: 5,
  visitorTotal: 15000,
  monthlyCharges: 3,
  monthlyTotal: 60000,
  totalTax: 2850,
};

function buildDeps(overrides: Partial<PerformDailyCloseDeps> = {}): PerformDailyCloseDeps {
  let idCount = 0;
  const ids = [CLOSE_ID, ACTIVITY_ID];
  return {
    dailyCloseRepo: {
      create: vi.fn().mockResolvedValue(undefined),
    },
    activityRepo: {
      log: vi.fn().mockResolvedValue(undefined),
    },
    generateId: vi.fn().mockImplementation(() => ids[idCount++] ?? 'fallback'),
    now: vi.fn().mockReturnValue(NOW),
    dateString: vi.fn().mockReturnValue(DATE_STR),
    ...overrides,
  };
}

describe('performDailyClose', () => {
  it('creates the close with correct total (visitors + monthly)', async () => {
    // Arrange
    const deps = buildDeps();
    const expectedTotal = inputBase.visitorTotal + inputBase.monthlyTotal; // 75000

    // Act
    const result = await performDailyClose(inputBase, deps);

    // Assert
    expect(result.total).toBe(expectedTotal);
    expect(result.visitorCharges).toBe(inputBase.visitorCharges);
    expect(result.visitorTotal).toBe(inputBase.visitorTotal);
    expect(result.monthlyCharges).toBe(inputBase.monthlyCharges);
    expect(result.monthlyTotal).toBe(inputBase.monthlyTotal);
    expect(result.totalTax).toBe(inputBase.totalTax);
  });

  it('includes closedAt and dateStr', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    const result = await performDailyClose(inputBase, deps);

    // Assert
    expect(result.closedAt).toBe(NOW);
    expect(result.dateStr).toBe(DATE_STR);
  });

  it('calls activityRepo', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    await performDailyClose(inputBase, deps);

    // Assert
    expect(deps.activityRepo.log).toHaveBeenCalledOnce();
    const actArg = (deps.activityRepo.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(actArg.category).toBe('daily-close');
    expect(actArg.ts).toBe(NOW);
  });

  it('returns created close', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    const result = await performDailyClose(inputBase, deps);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(CLOSE_ID);
    expect(deps.dailyCloseRepo.create).toHaveBeenCalledWith(result);
  });
});
