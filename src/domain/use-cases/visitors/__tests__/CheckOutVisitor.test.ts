import { describe, it, expect, vi } from 'vitest';
import type { IVisitorRepository } from '../../../repositories/IVisitorRepository';
import type { IActivityLogRepository } from '../../../repositories/IActivityLogRepository';
import type { Visitor } from '../../../entities/Visitor';
import { checkOutVisitor } from '../CheckOutVisitor';

// ─── Manual mock factories ────────────────────────────────────────────────────

function makeVisitorRepo(overrides: Partial<IVisitorRepository> = {}): IVisitorRepository {
  return {
    create: vi.fn(async (v: Visitor) => v),
    findById: vi.fn(async () => undefined),
    listActive: vi.fn(async () => []),
    recordCheckOut: vi.fn(async () => {}),
    countActive: vi.fn(async () => 0),
    activePlateExists: vi.fn(async () => false),
    findLastCheckOutByPlate: vi.fn(async () => undefined),
    ...overrides,
  };
}

function makeActivityLogRepo(): IActivityLogRepository {
  return { log: vi.fn(async () => {}) };
}

// ─── Test visitor fixture ─────────────────────────────────────────────────────

/**
 * Visitor who checked in exactly 3 hours ago with courtesy enabled.
 * The checkIn is computed at mock construction time so that
 * `Date.now() - checkIn` is always ~3h when `now()` returns the current timestamp.
 */
function makeVisitorMock(overrides: Partial<Visitor> = {}): Visitor {
  const nowTs = Date.now();
  return {
    id: 'v1',
    aptCode: 'T01-101',
    plate: 'ABC123',
    vehicleType: 'car',
    name: 'Visitor',
    phone: null,
    checkIn: new Date(nowTs - 3 * 3600_000).toISOString(), // 3 hours ago
    checkOut: null,
    hours: null,
    baseAmount: null,
    tax: null,
    total: null,
    courtesyApplies: true,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('checkOutVisitor', () => {
  it('throws error if visitor does not exist', async () => {
    // Arrange
    const visitorRepo = makeVisitorRepo({ findById: vi.fn(async () => undefined) });
    const activityRepo = makeActivityLogRepo();
    const deps = { visitorRepo, activityRepo, now: vi.fn(() => new Date().toISOString()) };
    const input = { visitorId: 'no-exists', hourlyRate: 1000, freeHours: 2, taxRate: 19 };
    // Act & Assert
    await expect(checkOutVisitor(input, deps)).rejects.toThrow('Visitor not found');
  });

  it('calculates charge correctly for 3-hour visit with 2 free hours', async () => {
    // Arrange — visitor checked in 3h ago, 2 free → charges 1h at $1000
    const visitor = makeVisitorMock({ courtesyApplies: true });
    const visitorRepo = makeVisitorRepo({ findById: vi.fn(async () => visitor) });
    const activityRepo = makeActivityLogRepo();
    const deps = { visitorRepo, activityRepo, now: vi.fn(() => new Date().toISOString()) };
    const input = { visitorId: 'v1', hourlyRate: 1000, freeHours: 2, taxRate: 19 };
    // Act
    const result = await checkOutVisitor(input, deps);
    // Assert
    expect(result.chargedHours).toBe(1);
    expect(result.baseAmount).toBe(1000);
    expect(result.total).toBe(1000);
  });

  it('charges 0 if stayed less than free hours', async () => {
    // Arrange — visitor checked in 1h ago, 2 free → charges 0
    const nowTs = Date.now();
    const visitor = makeVisitorMock({
      checkIn: new Date(nowTs - 1 * 3600_000).toISOString(),
      courtesyApplies: true,
    });
    const visitorRepo = makeVisitorRepo({ findById: vi.fn(async () => visitor) });
    const activityRepo = makeActivityLogRepo();
    const deps = { visitorRepo, activityRepo, now: vi.fn(() => new Date(nowTs).toISOString()) };
    const input = { visitorId: 'v1', hourlyRate: 1000, freeHours: 2, taxRate: 19 };
    // Act
    const result = await checkOutVisitor(input, deps);
    // Assert
    expect(result.chargedHours).toBe(0);
    expect(result.baseAmount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('records checkout in repo with correct data', async () => {
    // Arrange
    const visitor = makeVisitorMock({ courtesyApplies: true });
    const visitorRepo = makeVisitorRepo({ findById: vi.fn(async () => visitor) });
    const activityRepo = makeActivityLogRepo();
    const nowTs = new Date().toISOString();
    const deps = { visitorRepo, activityRepo, now: vi.fn(() => nowTs) };
    const input = { visitorId: 'v1', hourlyRate: 1000, freeHours: 2, taxRate: 19 };
    // Act
    await checkOutVisitor(input, deps);
    // Assert
    expect(visitorRepo.recordCheckOut).toHaveBeenCalledOnce();
    const [id, updates] = vi.mocked(visitorRepo.recordCheckOut).mock.calls[0];
    expect(id).toBe('v1');
    expect(updates.checkOut).toBe(nowTs);
    expect(typeof updates.hours).toBe('number');
    expect(typeof updates.baseAmount).toBe('number');
    expect(typeof updates.total).toBe('number');
  });

  it('calls activityRepo with checkout message', async () => {
    // Arrange
    const visitor = makeVisitorMock({ plate: 'ABC123', courtesyApplies: true });
    const visitorRepo = makeVisitorRepo({ findById: vi.fn(async () => visitor) });
    const activityRepo = makeActivityLogRepo();
    const deps = { visitorRepo, activityRepo, now: vi.fn(() => new Date().toISOString()) };
    const input = { visitorId: 'v1', hourlyRate: 1000, freeHours: 2, taxRate: 19 };
    // Act
    await checkOutVisitor(input, deps);
    // Assert
    expect(activityRepo.log).toHaveBeenCalledOnce();
    const activity = vi.mocked(activityRepo.log).mock.calls[0][0];
    expect(activity.msg).toContain('ABC123');
  });

  it('returns courtesyApplied according to visitor', async () => {
    // Arrange — visitor without courtesy
    const visitor = makeVisitorMock({ courtesyApplies: false });
    const visitorRepo = makeVisitorRepo({ findById: vi.fn(async () => visitor) });
    const activityRepo = makeActivityLogRepo();
    const deps = { visitorRepo, activityRepo, now: vi.fn(() => new Date().toISOString()) };
    const input = { visitorId: 'v1', hourlyRate: 1000, freeHours: 2, taxRate: 19 };
    // Act
    const result = await checkOutVisitor(input, deps);
    // Assert
    expect(result.courtesyApplied).toBe(false);
  });

  it('charges from hour 1 when courtesyApplies=false', async () => {
    // Arrange — visitor without courtesy, stayed 1h → charges 1h from start
    const nowTs = Date.now();
    const visitor = makeVisitorMock({
      checkIn: new Date(nowTs - 1 * 3600_000).toISOString(),
      courtesyApplies: false,
    });
    const visitorRepo = makeVisitorRepo({ findById: vi.fn(async () => visitor) });
    const activityRepo = makeActivityLogRepo();
    const deps = { visitorRepo, activityRepo, now: vi.fn(() => new Date(nowTs).toISOString()) };
    const input = { visitorId: 'v1', hourlyRate: 1000, freeHours: 2, taxRate: 19 };
    // Act
    const result = await checkOutVisitor(input, deps);
    // Assert
    // No courtesy → freeHours=0 → 1h charged at $1000
    expect(result.chargedHours).toBe(1);
    expect(result.baseAmount).toBe(1000);
  });
});
