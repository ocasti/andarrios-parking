import { describe, it, expect, vi } from 'vitest';
import { realizarCierre } from '../RealizarCierre';
import type { RealizarCierreInput, RealizarCierreDeps } from '../RealizarCierre';

const AHORA = '2026-03-31T18:00:00.000Z';
const FECHA_STR = '2026-03-31';
const ID_CIERRE = 'cierre-id-1';
const ID_ACTIVIDAD = 'cierre-id-2';

const inputBase: RealizarCierreInput = {
  cobrosVis: 5,
  totalVis: 15000,
  cobrosMens: 3,
  totalMens: 60000,
  totalIva: 2850,
};

function buildDeps(overrides: Partial<RealizarCierreDeps> = {}): RealizarCierreDeps {
  let idCount = 0;
  const ids = [ID_CIERRE, ID_ACTIVIDAD];
  return {
    cierreRepo: {
      crear: vi.fn().mockResolvedValue(undefined),
    },
    actividadRepo: {
      registrar: vi.fn().mockResolvedValue(undefined),
    },
    generarId: vi.fn().mockImplementation(() => ids[idCount++] ?? 'fallback'),
    ahora: vi.fn().mockReturnValue(AHORA),
    fechaStr: vi.fn().mockReturnValue(FECHA_STR),
    ...overrides,
  };
}

describe('realizarCierre', () => {
  it('crea el cierre con total correcto (vis + mens)', async () => {
    // Arrange
    const deps = buildDeps();
    const totalEsperado = inputBase.totalVis + inputBase.totalMens; // 75000

    // Act
    const resultado = await realizarCierre(inputBase, deps);

    // Assert
    expect(resultado.total).toBe(totalEsperado);
    expect(resultado.cobrosVis).toBe(inputBase.cobrosVis);
    expect(resultado.totalVis).toBe(inputBase.totalVis);
    expect(resultado.cobrosMens).toBe(inputBase.cobrosMens);
    expect(resultado.totalMens).toBe(inputBase.totalMens);
    expect(resultado.totalIva).toBe(inputBase.totalIva);
  });

  it('incluye fecha y fechaStr', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    const resultado = await realizarCierre(inputBase, deps);

    // Assert
    expect(resultado.fecha).toBe(AHORA);
    expect(resultado.fechaStr).toBe(FECHA_STR);
  });

  it('llama a actividadRepo', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    await realizarCierre(inputBase, deps);

    // Assert
    expect(deps.actividadRepo.registrar).toHaveBeenCalledOnce();
    const actArg = (deps.actividadRepo.registrar as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(actArg.tipo).toBe('caja');
    expect(actArg.ts).toBe(AHORA);
  });

  it('retorna el cierre creado', async () => {
    // Arrange
    const deps = buildDeps();

    // Act
    const resultado = await realizarCierre(inputBase, deps);

    // Assert
    expect(resultado).toBeDefined();
    expect(resultado.id).toBe(ID_CIERRE);
    expect(deps.cierreRepo.crear).toHaveBeenCalledWith(resultado);
  });
});
