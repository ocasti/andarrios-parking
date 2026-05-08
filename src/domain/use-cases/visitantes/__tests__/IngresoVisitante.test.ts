import { describe, it, expect, vi } from 'vitest';
import type { IVisitanteRepository } from '../../../repositories/IVisitanteRepository';
import type { IActividadRepository } from '../../../repositories/IActividadRepository';
import type { Visitante } from '../../../entities/Visitante';
import { ingresoVisitante } from '../IngresoVisitante';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ID_FIJO = 'id-generado-001';
const TS_FIJO = '2026-05-08T12:00:00.000Z';

function makeDeps(overrides: { visitanteRepo?: Partial<IVisitanteRepository> } = {}) {
  return {
    visitanteRepo: makeVisitanteRepo(overrides.visitanteRepo),
    actividadRepo: makeActividadRepo(),
    generarId: vi.fn(() => ID_FIJO),
    ahora: vi.fn(() => TS_FIJO),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ingresoVisitante', () => {
  it('crea visitante con los datos correctos', async () => {
    // Arrange
    const deps = makeDeps();
    const input = {
      cod: 'T01-101',
      placa: 'ABC123',
      tipo: 'carro' as const,
      nombre: 'Carlos Ruiz',
      tel: '3001112233',
      horasMinRecortesia: 6,
      historialReciente: [],
    };
    // Act
    const { visitante } = await ingresoVisitante(input, deps);
    // Assert
    expect(visitante.cod).toBe('T01-101');
    expect(visitante.placa).toBe('ABC123');
    expect(visitante.tipo).toBe('carro');
    expect(visitante.nombre).toBe('Carlos Ruiz');
    expect(visitante.tel).toBe('3001112233');
    expect(visitante.salida).toBeNull();
    expect(visitante.horas).toBeNull();
    expect(visitante.base).toBeNull();
    expect(visitante.iva).toBeNull();
    expect(visitante.total).toBeNull();
  });

  it('aplica cortesía cuando no hay historial reciente', async () => {
    // Arrange
    const deps = makeDeps();
    const input = {
      cod: 'T01-101',
      placa: 'ABC123',
      tipo: 'carro' as const,
      nombre: 'Visitante',
      tel: null,
      horasMinRecortesia: 6,
      historialReciente: [],
    };
    // Act
    const { cortesiaAplica, visitante } = await ingresoVisitante(input, deps);
    // Assert
    expect(cortesiaAplica).toBe(true);
    expect(visitante.cortesiaAplica).toBe(true);
  });

  it('no aplica cortesía cuando hay salida reciente (reingreso)', async () => {
    // Arrange
    const deps = makeDeps();
    const input = {
      cod: 'T01-101',
      placa: 'ABC123',
      tipo: 'moto' as const,
      nombre: 'Visitante',
      tel: null,
      horasMinRecortesia: 6,
      historialReciente: [{ salidaAt: new Date().toISOString() }],
    };
    // Act
    const { cortesiaAplica, visitante } = await ingresoVisitante(input, deps);
    // Assert
    expect(cortesiaAplica).toBe(false);
    expect(visitante.cortesiaAplica).toBe(false);
  });

  it('llama a actividadRepo.registrar con mensaje apropiado', async () => {
    // Arrange
    const deps = makeDeps();
    const input = {
      cod: 'T02-203',
      placa: 'XYZ999',
      tipo: 'carro' as const,
      nombre: 'Visitante',
      tel: null,
      horasMinRecortesia: 6,
      historialReciente: [],
    };
    // Act
    await ingresoVisitante(input, deps);
    // Assert
    expect(deps.actividadRepo.registrar).toHaveBeenCalledOnce();
    const llamada = vi.mocked(deps.actividadRepo.registrar).mock.calls[0][0];
    expect(llamada.msg).toContain('XYZ999');
    expect(llamada.msg).toContain('T02-203');
  });

  it('llama a actividadRepo con "sin cortesía" cuando hay reingreso', async () => {
    // Arrange
    const deps = makeDeps();
    const input = {
      cod: 'T01-101',
      placa: 'ABC123',
      tipo: 'carro' as const,
      nombre: 'Visitante',
      tel: null,
      horasMinRecortesia: 6,
      historialReciente: [{ salidaAt: new Date().toISOString() }],
    };
    // Act
    await ingresoVisitante(input, deps);
    // Assert
    const llamada = vi.mocked(deps.actividadRepo.registrar).mock.calls[0][0];
    expect(llamada.msg.toLowerCase()).toContain('cortesía');
  });

  it('usa el id generado por generarId', async () => {
    // Arrange
    const deps = makeDeps();
    const input = {
      cod: 'T01-101',
      placa: 'ABC123',
      tipo: 'carro' as const,
      nombre: 'Visitante',
      tel: null,
      horasMinRecortesia: 6,
      historialReciente: [],
    };
    // Act
    const { visitante } = await ingresoVisitante(input, deps);
    // Assert
    expect(deps.generarId).toHaveBeenCalled();
    expect(visitante.id).toBe(ID_FIJO);
  });

  it('usa el timestamp de ahora() para la entrada', async () => {
    // Arrange
    const deps = makeDeps();
    const input = {
      cod: 'T01-101',
      placa: 'ABC123',
      tipo: 'carro' as const,
      nombre: 'Visitante',
      tel: null,
      horasMinRecortesia: 6,
      historialReciente: [],
    };
    // Act
    const { visitante } = await ingresoVisitante(input, deps);
    // Assert
    expect(deps.ahora).toHaveBeenCalled();
    expect(visitante.entrada).toBe(TS_FIJO);
    expect(visitante.createdAt).toBe(TS_FIJO);
    expect(visitante.updatedAt).toBe(TS_FIJO);
  });

  it('llama a visitanteRepo.crear con el visitante construido', async () => {
    // Arrange
    const deps = makeDeps();
    const input = {
      cod: 'T01-101',
      placa: 'ABC123',
      tipo: 'carro' as const,
      nombre: 'Visitante',
      tel: null,
      horasMinRecortesia: 6,
      historialReciente: [],
    };
    // Act
    await ingresoVisitante(input, deps);
    // Assert
    expect(deps.visitanteRepo.crear).toHaveBeenCalledOnce();
    const argCrear = vi.mocked(deps.visitanteRepo.crear).mock.calls[0][0];
    expect(argCrear.id).toBe(ID_FIJO);
    expect(argCrear.placa).toBe('ABC123');
  });
});
