import { describe, it, expect, vi } from 'vitest';
import { markAsPaid } from '../MarkAsPaid';
import type { MarkAsPaidInput, MarkAsPaidDeps } from '../MarkAsPaid';
import type { Resident, MonthlyFee } from '../../../entities';

const NOW = '2026-02-10T09:00:00.000Z';
const MONTH_KEY = '2026-02';
const RATES = { carAmount: 20000, motorcycleAmount: 10000 };

const carResident: Resident = {
  id: 'res-car',
  aptCode: 'T01-101',
  tower: 1,
  floor: 1,
  unit: 101,
  plate: 'CAR001',
  vehicleType: 'car',
  name: 'Carlos Ruiz',
  phone: null,
  registrationDate: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  deletedAt: null,
};

const motorcycleResident: Resident = {
  ...carResident,
  id: 'res-motorcycle',
  plate: 'MOT001',
  vehicleType: 'motorcycle',
  name: 'Ana Torres',
};

const existingMonthlyFee: MonthlyFee = {
  id: 'fee-1',
  residentId: carResident.id,
  monthKey: MONTH_KEY,
  status: 'pending',
  paymentDate: null,
  amount: null,
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

function buildDeps(
  resident: Resident | undefined,
  monthlyFee: MonthlyFee | undefined,
): MarkAsPaidDeps {
  let idCount = 0;
  return {
    residentRepo: {
      findById: vi.fn().mockResolvedValue(resident),
    },
    monthlyFeeRepo: {
      findByResidentAndMonth: vi.fn().mockResolvedValue(monthlyFee),
      create: vi.fn().mockImplementation(async (m: MonthlyFee) => m),
      update: vi.fn().mockResolvedValue(undefined),
    },
    paymentRepo: {
      create: vi.fn().mockResolvedValue(undefined),
    },
    activityRepo: {
      log: vi.fn().mockResolvedValue(undefined),
    },
    generateId: vi.fn().mockImplementation(() => `gen-id-${++idCount}`),
    now: vi.fn().mockReturnValue(NOW),
  };
}

describe('markAsPaid', () => {
  it('throws if resident does not exist', async () => {
    // Arrange
    const deps = buildDeps(undefined, undefined);
    const input: MarkAsPaidInput = {
      residentId: 'no-exists',
      rates: RATES,
      monthKey: MONTH_KEY,
    };

    // Act & Assert
    await expect(markAsPaid(input, deps)).rejects.toThrow('Resident not found');
  });

  it('updates existing monthly fee to paid', async () => {
    // Arrange
    const deps = buildDeps(carResident, existingMonthlyFee);
    const input: MarkAsPaidInput = {
      residentId: carResident.id,
      rates: RATES,
      monthKey: MONTH_KEY,
    };

    // Act
    await markAsPaid(input, deps);

    // Assert
    expect(deps.monthlyFeeRepo.update).toHaveBeenCalledWith(
      existingMonthlyFee.id,
      expect.objectContaining({
        status: 'paid',
        paymentDate: NOW,
        amount: RATES.carAmount,
        updatedAt: NOW,
      }),
    );
    expect(deps.monthlyFeeRepo.create).not.toHaveBeenCalled();
  });

  it('creates new monthly fee if none exists for the month', async () => {
    // Arrange
    const deps = buildDeps(carResident, undefined);
    const input: MarkAsPaidInput = {
      residentId: carResident.id,
      rates: RATES,
      monthKey: MONTH_KEY,
    };

    // Act
    await markAsPaid(input, deps);

    // Assert
    expect(deps.monthlyFeeRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        residentId: carResident.id,
        monthKey: MONTH_KEY,
        status: 'paid',
        amount: RATES.carAmount,
        paymentDate: NOW,
      }),
    );
    expect(deps.monthlyFeeRepo.update).not.toHaveBeenCalled();
  });

  it('calculates car amount correctly', async () => {
    // Arrange
    const deps = buildDeps(carResident, undefined);
    const input: MarkAsPaidInput = {
      residentId: carResident.id,
      rates: RATES,
      monthKey: MONTH_KEY,
    };

    // Act
    await markAsPaid(input, deps);

    // Assert
    const paymentArg = (deps.paymentRepo.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(paymentArg.amount).toBe(RATES.carAmount);
  });

  it('calculates motorcycle amount correctly', async () => {
    // Arrange
    const deps = buildDeps(motorcycleResident, undefined);
    const input: MarkAsPaidInput = {
      residentId: motorcycleResident.id,
      rates: RATES,
      monthKey: MONTH_KEY,
    };

    // Act
    await markAsPaid(input, deps);

    // Assert
    const paymentArg = (deps.paymentRepo.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(paymentArg.amount).toBe(RATES.motorcycleAmount);
  });

  it('creates record of MonthlyPayment', async () => {
    // Arrange
    const deps = buildDeps(carResident, existingMonthlyFee);
    const input: MarkAsPaidInput = {
      residentId: carResident.id,
      rates: RATES,
      monthKey: MONTH_KEY,
    };

    // Act
    await markAsPaid(input, deps);

    // Assert
    expect(deps.paymentRepo.create).toHaveBeenCalledOnce();
    expect(deps.paymentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        residentId: carResident.id,
        plate: carResident.plate,
        aptCode: carResident.aptCode,
        name: carResident.name,
        vehicleType: carResident.vehicleType,
        date: NOW,
        amount: RATES.carAmount,
        monthKey: MONTH_KEY,
      }),
    );
  });

  it('logs activity', async () => {
    // Arrange
    const deps = buildDeps(carResident, existingMonthlyFee);
    const input: MarkAsPaidInput = {
      residentId: carResident.id,
      rates: RATES,
      monthKey: MONTH_KEY,
    };

    // Act
    await markAsPaid(input, deps);

    // Assert
    expect(deps.activityRepo.log).toHaveBeenCalledOnce();
    const actArg = (deps.activityRepo.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(actArg.category).toBe('monthly-fee');
    expect(actArg.ts).toBe(NOW);
  });
});
