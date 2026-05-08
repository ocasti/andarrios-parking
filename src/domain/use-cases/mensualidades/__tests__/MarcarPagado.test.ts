import { describe, it, expect, vi } from 'vitest';
import { marcarPagado } from '../MarcarPagado';
import type { MarcarPagadoInput, MarcarPagadoDeps } from '../MarcarPagado';
import type { Residente, Mensualidad } from '../../../entities';

const AHORA = '2026-02-10T09:00:00.000Z';
const MES_KEY = '2026-02';
const TARIFA = { carroMes: 20000, motoMes: 10000 };

const residenteCarro: Residente = {
  id: 'res-carro',
  cod: 'T01-101',
  torre: 1,
  piso: 1,
  apto: 101,
  placa: 'CAR001',
  tipo: 'carro',
  nombre: 'Carlos Ruiz',
  cel: null,
  fechaRegistro: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  deletedAt: null,
};

const residenteMoto: Residente = {
  ...residenteCarro,
  id: 'res-moto',
  placa: 'MOT001',
  tipo: 'moto',
  nombre: 'Ana Torres',
};

const mensualidadExistente: Mensualidad = {
  id: 'mens-1',
  residenteId: residenteCarro.id,
  mesKey: MES_KEY,
  estado: 'pendiente',
  fechaPago: null,
  monto: null,
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

function buildDeps(
  residente: Residente | undefined,
  mensualidad: Mensualidad | undefined,
): MarcarPagadoDeps {
  let idCount = 0;
  return {
    residenteRepo: {
      obtenerPorId: vi.fn().mockResolvedValue(residente),
    },
    mensualidadRepo: {
      obtenerPorResidenteYMes: vi.fn().mockResolvedValue(mensualidad),
      crear: vi.fn().mockImplementation(async (m: Mensualidad) => m),
      actualizar: vi.fn().mockResolvedValue(undefined),
    },
    pagoRepo: {
      crear: vi.fn().mockResolvedValue(undefined),
    },
    actividadRepo: {
      registrar: vi.fn().mockResolvedValue(undefined),
    },
    generarId: vi.fn().mockImplementation(() => `gen-id-${++idCount}`),
    ahora: vi.fn().mockReturnValue(AHORA),
  };
}

describe('marcarPagado', () => {
  it('lanza si el residente no existe', async () => {
    // Arrange
    const deps = buildDeps(undefined, undefined);
    const input: MarcarPagadoInput = {
      residenteId: 'no-existe',
      tarifa: TARIFA,
      mesKey: MES_KEY,
    };

    // Act & Assert
    await expect(marcarPagado(input, deps)).rejects.toThrow('Residente no encontrado');
  });

  it('actualiza mensualidad existente a pagado', async () => {
    // Arrange
    const deps = buildDeps(residenteCarro, mensualidadExistente);
    const input: MarcarPagadoInput = {
      residenteId: residenteCarro.id,
      tarifa: TARIFA,
      mesKey: MES_KEY,
    };

    // Act
    await marcarPagado(input, deps);

    // Assert
    expect(deps.mensualidadRepo.actualizar).toHaveBeenCalledWith(
      mensualidadExistente.id,
      expect.objectContaining({
        estado: 'pagado',
        fechaPago: AHORA,
        monto: TARIFA.carroMes,
        updatedAt: AHORA,
      }),
    );
    expect(deps.mensualidadRepo.crear).not.toHaveBeenCalled();
  });

  it('crea nueva mensualidad si no existe para el mes', async () => {
    // Arrange
    const deps = buildDeps(residenteCarro, undefined);
    const input: MarcarPagadoInput = {
      residenteId: residenteCarro.id,
      tarifa: TARIFA,
      mesKey: MES_KEY,
    };

    // Act
    await marcarPagado(input, deps);

    // Assert
    expect(deps.mensualidadRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        residenteId: residenteCarro.id,
        mesKey: MES_KEY,
        estado: 'pagado',
        monto: TARIFA.carroMes,
        fechaPago: AHORA,
      }),
    );
    expect(deps.mensualidadRepo.actualizar).not.toHaveBeenCalled();
  });

  it('calcula monto carro correctamente', async () => {
    // Arrange
    const deps = buildDeps(residenteCarro, undefined);
    const input: MarcarPagadoInput = {
      residenteId: residenteCarro.id,
      tarifa: TARIFA,
      mesKey: MES_KEY,
    };

    // Act
    await marcarPagado(input, deps);

    // Assert
    const pagoArg = (deps.pagoRepo.crear as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(pagoArg.monto).toBe(TARIFA.carroMes);
  });

  it('calcula monto moto correctamente', async () => {
    // Arrange
    const deps = buildDeps(residenteMoto, undefined);
    const input: MarcarPagadoInput = {
      residenteId: residenteMoto.id,
      tarifa: TARIFA,
      mesKey: MES_KEY,
    };

    // Act
    await marcarPagado(input, deps);

    // Assert
    const pagoArg = (deps.pagoRepo.crear as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(pagoArg.monto).toBe(TARIFA.motoMes);
  });

  it('crea registro de PagoMensualidad', async () => {
    // Arrange
    const deps = buildDeps(residenteCarro, mensualidadExistente);
    const input: MarcarPagadoInput = {
      residenteId: residenteCarro.id,
      tarifa: TARIFA,
      mesKey: MES_KEY,
    };

    // Act
    await marcarPagado(input, deps);

    // Assert
    expect(deps.pagoRepo.crear).toHaveBeenCalledOnce();
    expect(deps.pagoRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        residenteId: residenteCarro.id,
        placa: residenteCarro.placa,
        cod: residenteCarro.cod,
        nombre: residenteCarro.nombre,
        tipo: residenteCarro.tipo,
        fecha: AHORA,
        monto: TARIFA.carroMes,
        mesKey: MES_KEY,
      }),
    );
  });

  it('registra actividad', async () => {
    // Arrange
    const deps = buildDeps(residenteCarro, mensualidadExistente);
    const input: MarcarPagadoInput = {
      residenteId: residenteCarro.id,
      tarifa: TARIFA,
      mesKey: MES_KEY,
    };

    // Act
    await marcarPagado(input, deps);

    // Assert
    expect(deps.actividadRepo.registrar).toHaveBeenCalledOnce();
    const actArg = (deps.actividadRepo.registrar as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(actArg.tipo).toBe('mensualidad');
    expect(actArg.ts).toBe(AHORA);
  });
});
