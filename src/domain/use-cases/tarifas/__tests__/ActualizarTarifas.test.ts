import { describe, it, expect, vi } from 'vitest';
import { actualizarTarifas } from '../ActualizarTarifas';
import type { ActualizarTarifasDeps } from '../ActualizarTarifas';
import type { Tarifa } from '../../../entities';

const AHORA = '2026-04-01T08:00:00.000Z';

const tarifaActual: Tarifa = {
  id: 1,
  carroMes: 20000,
  motoMes: 10000,
  visHora: 1000,
  horasGratis: 2,
  iva: 19,
  capacidadVisitantes: 0,
  horasMinRecortesia: 6,
  updatedAt: '2025-01-01T00:00:00.000Z',
};

function buildDeps(overrides: Partial<ActualizarTarifasDeps> = {}): ActualizarTarifasDeps {
  return {
    tarifaRepo: {
      guardar: vi.fn().mockResolvedValue(undefined),
    },
    actividadRepo: {
      registrar: vi.fn().mockResolvedValue(undefined),
    },
    ahora: vi.fn().mockReturnValue(AHORA),
    ...overrides,
  };
}

describe('actualizarTarifas', () => {
  it('actualiza solo los campos enviados', async () => {
    // Arrange
    const deps = buildDeps();
    const datos = { carroMes: 25000 };

    // Act
    const resultado = await actualizarTarifas(datos, tarifaActual, deps);

    // Assert
    expect(resultado.carroMes).toBe(25000);
  });

  it('mantiene campos no enviados con valores anteriores', async () => {
    // Arrange
    const deps = buildDeps();
    const datos = { carroMes: 25000 };

    // Act
    const resultado = await actualizarTarifas(datos, tarifaActual, deps);

    // Assert
    expect(resultado.motoMes).toBe(tarifaActual.motoMes);
    expect(resultado.visHora).toBe(tarifaActual.visHora);
    expect(resultado.horasGratis).toBe(tarifaActual.horasGratis);
    expect(resultado.iva).toBe(tarifaActual.iva);
    expect(resultado.capacidadVisitantes).toBe(tarifaActual.capacidadVisitantes);
    expect(resultado.horasMinRecortesia).toBe(tarifaActual.horasMinRecortesia);
    expect(resultado.id).toBe(tarifaActual.id);
  });

  it('actualiza updatedAt', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    const resultado = await actualizarTarifas({}, tarifaActual, deps);

    // Assert
    expect(resultado.updatedAt).toBe(AHORA);
    expect(resultado.updatedAt).not.toBe(tarifaActual.updatedAt);
  });

  it('guarda en el repo', async () => {
    // Arrange
    const deps = buildDeps();
    const datos = { motoMes: 12000, iva: 20 };

    // Act
    const resultado = await actualizarTarifas(datos, tarifaActual, deps);

    // Assert
    expect(deps.tarifaRepo.guardar).toHaveBeenCalledOnce();
    expect(deps.tarifaRepo.guardar).toHaveBeenCalledWith(resultado);
  });

  it('registra actividad', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    await actualizarTarifas({ visHora: 1500 }, tarifaActual, deps);

    // Assert
    expect(deps.actividadRepo.registrar).toHaveBeenCalledOnce();
    const actArg = (deps.actividadRepo.registrar as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(actArg.tipo).toBe('tarifas');
    expect(actArg.ts).toBe(AHORA);
  });
});
