import { describe, it, expect } from 'vitest';
import { calcularMontoMensualidad, generarMesKey, esMismoMes } from '../MensualidadService';
import type { TarifaMensual } from '../MensualidadService';

describe('calcularMontoMensualidad', () => {
  it('retorna carroMes para tipo carro', () => {
    // Arrange
    const tarifa: TarifaMensual = { carroMes: 25000, motoMes: 12000 };
    // Act
    const result = calcularMontoMensualidad('carro', tarifa);
    // Assert
    expect(result).toBe(25000);
  });

  it('retorna motoMes para tipo moto', () => {
    // Arrange
    const tarifa: TarifaMensual = { carroMes: 25000, motoMes: 12000 };
    // Act
    const result = calcularMontoMensualidad('moto', tarifa);
    // Assert
    expect(result).toBe(12000);
  });

  it('con tarifa { carroMes:25000, motoMes:12000 } → carro=25000, moto=12000', () => {
    // Arrange
    const tarifa: TarifaMensual = { carroMes: 25000, motoMes: 12000 };
    // Act & Assert
    expect(calcularMontoMensualidad('carro', tarifa)).toBe(25000);
    expect(calcularMontoMensualidad('moto', tarifa)).toBe(12000);
  });
});

describe('generarMesKey', () => {
  it('retorna formato YYYY-MM', () => {
    // Arrange / Act
    const result = generarMesKey(new Date());
    // Assert
    expect(result).toMatch(/^\d{4}-\d{2}$/);
  });

  it('retorna el mes correcto para una fecha conocida', () => {
    // Arrange — 2026-05-08 10:00 UTC = 2026-05-08 05:00 en Bogotá → mes 2026-05
    const fecha = new Date('2026-05-08T10:00:00Z');
    // Act
    const result = generarMesKey(fecha);
    // Assert
    expect(result).toBe('2026-05');
  });

  it('sin parámetro retorna el mes actual', () => {
    // Arrange
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
    });
    const expectedRaw = formatter.format(now);
    // en-CA con year+month puede devolver "2026-05" o "05/2026" según runtime
    // Usamos slice(0,7) del colDateStr approach para consistencia:
    const ymdFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const expected = ymdFormatter.format(now).slice(0, 7);
    // Act
    const result = generarMesKey();
    // Assert
    expect(result).toBe(expected);
  });
});

describe('esMismoMes', () => {
  it('true para mismas claves', () => {
    // Arrange / Act
    const result = esMismoMes('2026-05', '2026-05');
    // Assert
    expect(result).toBe(true);
  });

  it('false para claves distintas', () => {
    // Arrange / Act
    const result = esMismoMes('2026-05', '2026-06');
    // Assert
    expect(result).toBe(false);
  });

  it('false para año distinto mismo mes', () => {
    // Arrange / Act
    const result = esMismoMes('2025-05', '2026-05');
    // Assert
    expect(result).toBe(false);
  });
});
