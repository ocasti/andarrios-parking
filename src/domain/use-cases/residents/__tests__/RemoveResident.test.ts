import { describe, it, expect, vi } from 'vitest';
import { removeResident } from '../RemoveResident';
import type { RemoveResidentDeps } from '../RemoveResident';
import type { Resident } from '../../../entities';

const NOW = '2026-01-15T10:00:00.000Z';
const RESIDENT_ID = 'id-resident-99';

const existingResident: Resident = {
  id: RESIDENT_ID,
  aptCode: 'T02-201',
  tower: 2,
  floor: 2,
  unit: 201,
  plate: 'XYZ789',
  vehicleType: 'motorcycle',
  name: 'María López',
  phone: null,
  registrationDate: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  deletedAt: null,
};

function buildDeps(resident: Resident | undefined): RemoveResidentDeps {
  return {
    residentRepo: {
      findById: vi.fn().mockResolvedValue(resident),
      softDelete: vi.fn().mockResolvedValue(undefined),
    },
    activityRepo: {
      log: vi.fn().mockResolvedValue(undefined),
    },
    now: vi.fn().mockReturnValue(NOW),
  };
}

describe('removeResident', () => {
  it('marks as deleted with deletedAt', async () => {
    // Arrange
    const deps = buildDeps(existingResident);

    // Act
    await removeResident(RESIDENT_ID, deps);

    // Assert
    expect(deps.residentRepo.softDelete).toHaveBeenCalledWith(RESIDENT_ID, NOW);
  });

  it('does not throw if resident does not exist', async () => {
    // Arrange
    const deps = buildDeps(undefined);

    // Act & Assert
    await expect(removeResident('id-nonexistent', deps)).resolves.toBeUndefined();
    expect(deps.residentRepo.softDelete).not.toHaveBeenCalled();
  });

  it('logs activity with the removed plate', async () => {
    // Arrange
    const deps = buildDeps(existingResident);

    // Act
    await removeResident(RESIDENT_ID, deps);

    // Assert
    expect(deps.activityRepo.log).toHaveBeenCalledOnce();
    const activityArg = (deps.activityRepo.log as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(activityArg.msg).toContain(existingResident.plate);
    expect(activityArg.category).toBe('resident');
  });
});
