import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerResident } from '../RegisterResident';
import type { RegisterResidentInput, RegisterResidentDeps } from '../RegisterResident';
import type { Resident, MonthlyFee } from '../../../entities';

const NOW = '2026-01-15T10:00:00.000Z';
const MONTH_KEY = '2026-01';
const RESIDENT_ID = 'id-resident-1';
const MONTHLY_FEE_ID = 'id-monthly-fee-1';
const ACTIVITY_ID = 'id-activity-1';

const inputBase: RegisterResidentInput = {
  aptCode: 'T01-101',
  tower: 1,
  floor: 1,
  unit: 101,
  plate: 'ABC123',
  vehicleType: 'car',
  name: 'Juan Pérez',
  phone: '3001234567',
};

const createdResident: Resident = {
  id: RESIDENT_ID,
  aptCode: inputBase.aptCode,
  tower: inputBase.tower,
  floor: inputBase.floor,
  unit: inputBase.unit,
  plate: inputBase.plate,
  vehicleType: inputBase.vehicleType,
  name: inputBase.name,
  phone: inputBase.phone,
  registrationDate: NOW,
  createdAt: NOW,
  updatedAt: NOW,
  deletedAt: null,
};

function buildDeps(overrides: Partial<RegisterResidentDeps> = {}): RegisterResidentDeps {
  let idCount = 0;
  const ids = [RESIDENT_ID, MONTHLY_FEE_ID, ACTIVITY_ID];

  return {
    residentRepo: {
      create: vi.fn().mockResolvedValue(createdResident),
      plateExists: vi.fn().mockResolvedValue(false),
    },
    monthlyFeeRepo: {
      create: vi.fn().mockImplementation(async (m: MonthlyFee) => m),
    },
    activityRepo: {
      log: vi.fn().mockResolvedValue(undefined),
    },
    generateId: vi.fn().mockImplementation(() => ids[idCount++] ?? 'fallback-id'),
    now: vi.fn().mockReturnValue(NOW),
    currentMonthKey: vi.fn().mockReturnValue(MONTH_KEY),
    ...overrides,
  };
}

describe('registerResident', () => {
  it('creates resident with correct data', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    const result = await registerResident(inputBase, deps);

    // Assert
    expect(deps.residentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: RESIDENT_ID,
        aptCode: inputBase.aptCode,
        tower: inputBase.tower,
        floor: inputBase.floor,
        unit: inputBase.unit,
        plate: inputBase.plate,
        vehicleType: inputBase.vehicleType,
        name: inputBase.name,
        phone: inputBase.phone,
        registrationDate: NOW,
      }),
    );
    expect(result).toEqual(createdResident);
  });

  it('throws error if plate already exists', async () => {
    // Arrange
    const deps = buildDeps({
      residentRepo: {
        create: vi.fn(),
        plateExists: vi.fn().mockResolvedValue(true),
      },
    });

    // Act & Assert
    await expect(registerResident(inputBase, deps)).rejects.toThrow(
      'License plate already registered',
    );
    expect(deps.residentRepo.create).not.toHaveBeenCalled();
  });

  it('creates pending monthly fee for the current month', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    await registerResident(inputBase, deps);

    // Assert
    expect(deps.monthlyFeeRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        residentId: RESIDENT_ID,
        monthKey: MONTH_KEY,
        status: 'pending',
        paymentDate: null,
        amount: null,
      }),
    );
  });

  it('calls activityRepo.log', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    await registerResident(inputBase, deps);

    // Assert
    expect(deps.activityRepo.log).toHaveBeenCalledOnce();
    expect(deps.activityRepo.log).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'resident',
        ts: NOW,
      }),
    );
  });

  it('uses the generated id', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    await registerResident(inputBase, deps);

    // Assert
    expect(deps.generateId).toHaveBeenCalled();
    expect(deps.residentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: RESIDENT_ID }),
    );
  });
});
