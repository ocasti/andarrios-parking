import { describe, it, expect, vi } from 'vitest';
import { eliminarResidente } from '../EliminarResidente';
import type { EliminarResidenteDeps } from '../EliminarResidente';
import type { Residente } from '../../../entities';

const AHORA = '2026-01-15T10:00:00.000Z';
const ID_RESIDENTE = 'id-residente-99';

const residenteExistente: Residente = {
  id: ID_RESIDENTE,
  cod: 'T02-201',
  torre: 2,
  piso: 2,
  apto: 201,
  placa: 'XYZ789',
  tipo: 'moto',
  nombre: 'María López',
  cel: null,
  fechaRegistro: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  deletedAt: null,
};

function buildDeps(residente: Residente | undefined): EliminarResidenteDeps {
  return {
    residenteRepo: {
      obtenerPorId: vi.fn().mockResolvedValue(residente),
      eliminar: vi.fn().mockResolvedValue(undefined),
    },
    actividadRepo: {
      registrar: vi.fn().mockResolvedValue(undefined),
    },
    ahora: vi.fn().mockReturnValue(AHORA),
  };
}

describe('eliminarResidente', () => {
  it('marca como eliminado con deletedAt', async () => {
    // Arrange
    const deps = buildDeps(residenteExistente);

    // Act
    await eliminarResidente(ID_RESIDENTE, deps);

    // Assert
    expect(deps.residenteRepo.eliminar).toHaveBeenCalledWith(ID_RESIDENTE, AHORA);
  });

  it('no lanza si el residente no existe', async () => {
    // Arrange
    const deps = buildDeps(undefined);

    // Act & Assert
    await expect(eliminarResidente('id-inexistente', deps)).resolves.toBeUndefined();
    expect(deps.residenteRepo.eliminar).not.toHaveBeenCalled();
  });

  it('registra actividad con la placa eliminada', async () => {
    // Arrange
    const deps = buildDeps(residenteExistente);

    // Act
    await eliminarResidente(ID_RESIDENTE, deps);

    // Assert
    expect(deps.actividadRepo.registrar).toHaveBeenCalledOnce();
    const actividadArg = (deps.actividadRepo.registrar as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(actividadArg.msg).toContain(residenteExistente.placa);
    expect(actividadArg.tipo).toBe('residente');
  });
});
