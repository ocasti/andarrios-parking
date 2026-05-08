import { describe, it, expect, vi } from 'vitest';
import type { IVisitanteRepository } from '../../../repositories/IVisitanteRepository';
import type { IActividadRepository } from '../../../repositories/IActividadRepository';
import type { Visitante } from '../../../entities/Visitante';
import { salidaVisitante } from '../SalidaVisitante';

// ─── Factories de mocks manuales ──────────────────────────────────────────────

function makeVisitanteRepo(overrides: Partial<IVisitanteRepository> = {}): IVisitanteRepository {
  return {
    crear: vi.fn(async (v: Visitante) => v),
    obtenerPorId: vi.fn(async () => undefined),
    listarActivos: vi.fn(async () => []),
    registrarSalida: vi.fn(async () => {}),
    contarActivos: vi.fn(async () => 0),
    existePlacaActiva: vi.fn(async () => false),
    obtenerUltimaSalidaPorPlaca: vi.fn(async () => undefined),
    ...overrides,
  };
}

function makeActividadRepo(): IActividadRepository {
  return { registrar: vi.fn(async () => {}) };
}

// ─── Visitante de prueba ───────────────────────────────────────────────────────

/**
 * Visitante que ingresó hace exactamente 3 horas con cortesía activada.
 * La entrada se computa en el momento de construcción del mock para que
 * el delta de `Date.now() - entrada` sea siempre ~3 h cuando `ahora()`
 * retorna el timestamp actual.
 */
function makeVisitanteMock(overrides: Partial<Visitante> = {}): Visitante {
  const ahoraTs = Date.now();
  return {
    id: 'v1',
    cod: 'T01-101',
    placa: 'ABC123',
    tipo: 'carro',
    nombre: 'Visitante',
    tel: null,
    entrada: new Date(ahoraTs - 3 * 3600_000).toISOString(), // hace 3 horas
    salida: null,
    horas: null,
    base: null,
    iva: null,
    total: null,
    cortesiaAplica: true,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('salidaVisitante', () => {
  it('lanza error si el visitante no existe', async () => {
    // Arrange
    const visitanteRepo = makeVisitanteRepo({ obtenerPorId: vi.fn(async () => undefined) });
    const actividadRepo = makeActividadRepo();
    const deps = { visitanteRepo, actividadRepo, ahora: vi.fn(() => new Date().toISOString()) };
    const input = { visitanteId: 'no-existe', tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19 };
    // Act & Assert
    await expect(salidaVisitante(input, deps)).rejects.toThrow('Visitante no encontrado');
  });

  it('calcula el cobro correctamente para visita de 3 horas con 2 gratis', async () => {
    // Arrange — visitante entró hace 3h, 2h gratis → cobra 1h a $1000
    const visitante = makeVisitanteMock({ cortesiaAplica: true });
    const visitanteRepo = makeVisitanteRepo({ obtenerPorId: vi.fn(async () => visitante) });
    const actividadRepo = makeActividadRepo();
    const deps = { visitanteRepo, actividadRepo, ahora: vi.fn(() => new Date().toISOString()) };
    const input = { visitanteId: 'v1', tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19 };
    // Act
    const result = await salidaVisitante(input, deps);
    // Assert
    expect(result.horasCobradas).toBe(1);
    expect(result.base).toBe(1000);
    expect(result.total).toBe(1000);
  });

  it('cobra 0 si estuvo menos de las horas gratis', async () => {
    // Arrange — visitante entró hace 1h, 2h gratis → cobra 0
    const ahora = Date.now();
    const visitante = makeVisitanteMock({
      entrada: new Date(ahora - 1 * 3600_000).toISOString(),
      cortesiaAplica: true,
    });
    const visitanteRepo = makeVisitanteRepo({ obtenerPorId: vi.fn(async () => visitante) });
    const actividadRepo = makeActividadRepo();
    const deps = { visitanteRepo, actividadRepo, ahora: vi.fn(() => new Date(ahora).toISOString()) };
    const input = { visitanteId: 'v1', tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19 };
    // Act
    const result = await salidaVisitante(input, deps);
    // Assert
    expect(result.horasCobradas).toBe(0);
    expect(result.base).toBe(0);
    expect(result.total).toBe(0);
  });

  it('registra la salida en el repo con los datos correctos', async () => {
    // Arrange
    const visitante = makeVisitanteMock({ cortesiaAplica: true });
    const visitanteRepo = makeVisitanteRepo({ obtenerPorId: vi.fn(async () => visitante) });
    const actividadRepo = makeActividadRepo();
    const tsAhora = new Date().toISOString();
    const deps = { visitanteRepo, actividadRepo, ahora: vi.fn(() => tsAhora) };
    const input = { visitanteId: 'v1', tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19 };
    // Act
    await salidaVisitante(input, deps);
    // Assert
    expect(visitanteRepo.registrarSalida).toHaveBeenCalledOnce();
    const [id, datos] = vi.mocked(visitanteRepo.registrarSalida).mock.calls[0];
    expect(id).toBe('v1');
    expect(datos.salida).toBe(tsAhora);
    expect(typeof datos.horas).toBe('number');
    expect(typeof datos.base).toBe('number');
    expect(typeof datos.total).toBe('number');
  });

  it('llama a actividadRepo con mensaje de salida', async () => {
    // Arrange
    const visitante = makeVisitanteMock({ placa: 'ABC123', cortesiaAplica: true });
    const visitanteRepo = makeVisitanteRepo({ obtenerPorId: vi.fn(async () => visitante) });
    const actividadRepo = makeActividadRepo();
    const deps = { visitanteRepo, actividadRepo, ahora: vi.fn(() => new Date().toISOString()) };
    const input = { visitanteId: 'v1', tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19 };
    // Act
    await salidaVisitante(input, deps);
    // Assert
    expect(actividadRepo.registrar).toHaveBeenCalledOnce();
    const actividad = vi.mocked(actividadRepo.registrar).mock.calls[0][0];
    expect(actividad.msg).toContain('ABC123');
  });

  it('retorna cortesiaAplicada según el visitante', async () => {
    // Arrange — visitante sin cortesía
    const visitante = makeVisitanteMock({ cortesiaAplica: false });
    const visitanteRepo = makeVisitanteRepo({ obtenerPorId: vi.fn(async () => visitante) });
    const actividadRepo = makeActividadRepo();
    const deps = { visitanteRepo, actividadRepo, ahora: vi.fn(() => new Date().toISOString()) };
    const input = { visitanteId: 'v1', tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19 };
    // Act
    const result = await salidaVisitante(input, deps);
    // Assert
    expect(result.cortesiaAplicada).toBe(false);
  });

  it('cobra desde hora 1 cuando cortesiaAplica=false', async () => {
    // Arrange — visitante sin cortesía, estuvo 1h → cobra 1h desde el inicio
    const ahora = Date.now();
    const visitante = makeVisitanteMock({
      entrada: new Date(ahora - 1 * 3600_000).toISOString(),
      cortesiaAplica: false,
    });
    const visitanteRepo = makeVisitanteRepo({ obtenerPorId: vi.fn(async () => visitante) });
    const actividadRepo = makeActividadRepo();
    const deps = { visitanteRepo, actividadRepo, ahora: vi.fn(() => new Date(ahora).toISOString()) };
    const input = { visitanteId: 'v1', tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19 };
    // Act
    const result = await salidaVisitante(input, deps);
    // Assert
    // Sin cortesía → horasGratis=0 → 1h cobrada a $1000
    expect(result.horasCobradas).toBe(1);
    expect(result.base).toBe(1000);
  });
});
