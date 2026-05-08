import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registrarResidente } from '../RegistrarResidente';
import type { RegistrarResidenteInput, RegistrarResidenteDeps } from '../RegistrarResidente';
import type { Residente, Mensualidad } from '../../../entities';

const AHORA = '2026-01-15T10:00:00.000Z';
const MES_KEY = '2026-01';
const ID_RESIDENTE = 'id-residente-1';
const ID_MENSUALIDAD = 'id-mensualidad-1';
const ID_ACTIVIDAD = 'id-actividad-1';

const inputBase: RegistrarResidenteInput = {
  cod: 'T01-101',
  torre: 1,
  piso: 1,
  apto: 101,
  placa: 'ABC123',
  tipo: 'carro',
  nombre: 'Juan Pérez',
  cel: '3001234567',
};

const residenteCreado: Residente = {
  id: ID_RESIDENTE,
  cod: inputBase.cod,
  torre: inputBase.torre,
  piso: inputBase.piso,
  apto: inputBase.apto,
  placa: inputBase.placa,
  tipo: inputBase.tipo,
  nombre: inputBase.nombre,
  cel: inputBase.cel,
  fechaRegistro: AHORA,
  createdAt: AHORA,
  updatedAt: AHORA,
  deletedAt: null,
};

function buildDeps(overrides: Partial<RegistrarResidenteDeps> = {}): RegistrarResidenteDeps {
  let idCount = 0;
  const ids = [ID_RESIDENTE, ID_MENSUALIDAD, ID_ACTIVIDAD];

  return {
    residenteRepo: {
      crear: vi.fn().mockResolvedValue(residenteCreado),
      existePlaca: vi.fn().mockResolvedValue(false),
    },
    mensualidadRepo: {
      crear: vi.fn().mockImplementation(async (m: Mensualidad) => m),
    },
    actividadRepo: {
      registrar: vi.fn().mockResolvedValue(undefined),
    },
    generarId: vi.fn().mockImplementation(() => ids[idCount++] ?? 'fallback-id'),
    ahora: vi.fn().mockReturnValue(AHORA),
    mesKeyActual: vi.fn().mockReturnValue(MES_KEY),
    ...overrides,
  };
}

describe('registrarResidente', () => {
  it('crea residente con los datos correctos', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    const resultado = await registrarResidente(inputBase, deps);

    // Assert
    expect(deps.residenteRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        id: ID_RESIDENTE,
        cod: inputBase.cod,
        torre: inputBase.torre,
        piso: inputBase.piso,
        apto: inputBase.apto,
        placa: inputBase.placa,
        tipo: inputBase.tipo,
        nombre: inputBase.nombre,
        cel: inputBase.cel,
        fechaRegistro: AHORA,
      }),
    );
    expect(resultado).toEqual(residenteCreado);
  });

  it('lanza error si la placa ya existe', async () => {
    // Arrange
    const deps = buildDeps({
      residenteRepo: {
        crear: vi.fn(),
        existePlaca: vi.fn().mockResolvedValue(true),
      },
    });

    // Act & Assert
    await expect(registrarResidente(inputBase, deps)).rejects.toThrow(
      'La placa ya está registrada',
    );
    expect(deps.residenteRepo.crear).not.toHaveBeenCalled();
  });

  it('crea mensualidad pendiente del mes actual', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    await registrarResidente(inputBase, deps);

    // Assert
    expect(deps.mensualidadRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        residenteId: ID_RESIDENTE,
        mesKey: MES_KEY,
        estado: 'pendiente',
        fechaPago: null,
        monto: null,
      }),
    );
  });

  it('llama a actividadRepo.registrar', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    await registrarResidente(inputBase, deps);

    // Assert
    expect(deps.actividadRepo.registrar).toHaveBeenCalledOnce();
    expect(deps.actividadRepo.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'residente',
        ts: AHORA,
      }),
    );
  });

  it('usa el id generado', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    await registrarResidente(inputBase, deps);

    // Assert
    expect(deps.generarId).toHaveBeenCalled();
    expect(deps.residenteRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ id: ID_RESIDENTE }),
    );
  });
});
