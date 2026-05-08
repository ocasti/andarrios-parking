import { describe, it, expect } from 'vitest';
import { PRICING_DEFAULTS } from '../PricingConfig';
import type {
  VehicleType,
  Resident,
  NewResident,
} from '../Resident';
import type { Visitor, NewVisitor } from '../Visitor';
import type { MonthlyFee, FeeStatus } from '../MonthlyFee';
import type { PricingConfig } from '../PricingConfig';
import type { BlockedUnit } from '../BlockedUnit';
import type { DailyClose } from '../DailyClose';
import type { ActivityLog } from '../ActivityLog';
import type { MonthlyPayment } from '../MonthlyPayment';

// ---------------------------------------------------------------------------
// PRICING_DEFAULTS — only runtime constant in the entities module
// ---------------------------------------------------------------------------
describe('PRICING_DEFAULTS', () => {
  it('has correct default values', () => {
    expect(PRICING_DEFAULTS.carMonthlyRate).toBe(20000);
    expect(PRICING_DEFAULTS.motorcycleMonthlyRate).toBe(10000);
    expect(PRICING_DEFAULTS.hourlyRate).toBe(1000);
    expect(PRICING_DEFAULTS.freeHours).toBe(2);
    expect(PRICING_DEFAULTS.iva).toBe(19);
    expect(PRICING_DEFAULTS.visitorCapacity).toBe(0);
    expect(PRICING_DEFAULTS.minHoursForCourtesy).toBe(6);
  });

  it('does not include id or updatedAt (Omit<PricingConfig, "id" | "updatedAt">)', () => {
    expect('id' in PRICING_DEFAULTS).toBe(false);
    expect('updatedAt' in PRICING_DEFAULTS).toBe(false);
  });

  it('has exactly 7 properties', () => {
    expect(Object.keys(PRICING_DEFAULTS)).toHaveLength(7);
  });
});

// ---------------------------------------------------------------------------
// Shape checks on typed object literals
// ---------------------------------------------------------------------------
describe('Resident — shape', () => {
  it('accepts an object with all required fields', () => {
    const r: Resident = {
      id: 'uuid-1',
      aptCode: 'T01-101',
      tower: 1,
      floor: 1,
      unit: 1,
      plate: 'ABC123',
      vehicleType: 'car',
      name: 'Juan',
      phone: null,
      registrationDate: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      deletedAt: null,
    };
    expect(r.id).toBe('uuid-1');
    expect(r.vehicleType).toBe('car');
  });

  it('NewResident does not have id, createdAt, updatedAt, deletedAt', () => {
    const newResident: NewResident = {
      aptCode: 'T01-101',
      tower: 1,
      floor: 1,
      unit: 1,
      plate: 'ABC123',
      vehicleType: 'motorcycle',
      name: 'Ana',
      phone: '+573001234567',
      registrationDate: '2024-01-01T00:00:00.000Z',
    };
    expect(newResident.plate).toBe('ABC123');
    // type-level: the compiler would reject adding id / createdAt / etc.
  });
});

describe('VehicleType — union values', () => {
  it('accepts "car"', () => {
    const t: VehicleType = 'car';
    expect(t).toBe('car');
  });

  it('accepts "motorcycle"', () => {
    const t: VehicleType = 'motorcycle';
    expect(t).toBe('motorcycle');
  });
});

describe('FeeStatus — union values', () => {
  it('accepts "pending"', () => {
    const e: FeeStatus = 'pending';
    expect(e).toBe('pending');
  });

  it('accepts "paid"', () => {
    const e: FeeStatus = 'paid';
    expect(e).toBe('paid');
  });
});

describe('Visitor — shape', () => {
  it('accepts visitor with null checkOut (currently parked)', () => {
    const v: Visitor = {
      id: 'v-1',
      aptCode: 'T02-201',
      plate: 'XYZ789',
      vehicleType: 'car',
      name: 'Pedro',
      phone: null,
      checkIn: '2024-06-01T10:00:00.000Z',
      checkOut: null,
      hours: null,
      baseAmount: null,
      tax: null,
      total: null,
      courtesyApplies: false,
      createdAt: '2024-06-01T10:00:00.000Z',
      updatedAt: '2024-06-01T10:00:00.000Z',
    };
    expect(v.checkOut).toBeNull();
    expect(v.courtesyApplies).toBe(false);
  });

  it('NewVisitor only has the 5 check-in registration fields', () => {
    const nv: NewVisitor = {
      aptCode: 'T01-101',
      plate: 'ABC123',
      vehicleType: 'motorcycle',
      name: 'Laura',
      phone: null,
    };
    expect(Object.keys(nv)).toHaveLength(5);
  });
});

describe('MonthlyFee — shape', () => {
  it('accepts pending monthly fee without payment date', () => {
    const m: MonthlyFee = {
      id: 'm-1',
      residentId: 'r-1',
      monthKey: '2024-06',
      status: 'pending',
      paymentDate: null,
      amount: null,
      createdAt: '2024-06-01T00:00:00.000Z',
      updatedAt: '2024-06-01T00:00:00.000Z',
    };
    expect(m.status).toBe('pending');
    expect(m.paymentDate).toBeNull();
  });
});

describe('BlockedUnit — shape', () => {
  it('accepts active block with null unblockedAt', () => {
    const b: BlockedUnit = {
      id: 'bl-1',
      aptCode: 'T03-301',
      reason: 'Arrears',
      blockedAt: '2024-05-01',
      unblockedAt: null,
    };
    expect(b.unblockedAt).toBeNull();
  });
});

describe('DailyClose — shape', () => {
  it('accepts a close with all numeric fields', () => {
    const c: DailyClose = {
      id: 'cc-1',
      closedAt: '2024-06-30T23:59:59.000Z',
      dateStr: '2024-06-30',
      visitorCharges: 5,
      visitorTotal: 15000,
      monthlyCharges: 10,
      monthlyTotal: 200000,
      totalTax: 2850,
      total: 217850,
    };
    expect(c.total).toBe(217850);
  });
});

describe('ActivityLog — shape', () => {
  it('accepts activity with string category', () => {
    const a: ActivityLog = {
      id: 'act-1',
      msg: 'Entry registered',
      ts: '2024-06-01T10:00:00.000Z',
      category: 'visitor',
    };
    expect(a.category).toBe('visitor');
  });
});

describe('MonthlyPayment — shape', () => {
  it('accepts payment with all fields', () => {
    const p: MonthlyPayment = {
      id: 'pm-1',
      residentId: 'r-1',
      plate: 'ABC123',
      aptCode: 'T01-101',
      name: 'Juan',
      vehicleType: 'car',
      date: '2024-06-15T12:00:00.000Z',
      amount: 20000,
      monthKey: '2024-06',
    };
    expect(p.amount).toBe(20000);
    expect(p.vehicleType).toBe('car');
  });
});

describe('PricingConfig — shape', () => {
  it('accepts a complete pricing config', () => {
    const t: PricingConfig = {
      id: 1,
      ...PRICING_DEFAULTS,
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    expect(t.id).toBe(1);
    expect(t.carMonthlyRate).toBe(PRICING_DEFAULTS.carMonthlyRate);
  });
});
