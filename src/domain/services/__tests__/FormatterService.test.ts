import { describe, it, expect } from 'vitest';
import {
  formatCOP,
  formatHora,
  formatFecha,
  colDateStr,
  colStartOfDay,
  colStartOfMonth,
} from '../FormatterService';

describe('formatCOP', () => {
  it("formatea 1500 como '$1.500'", () => {
    // Arrange / Act
    const result = formatCOP(1500);
    // Assert
    expect(result).toBe('$1.500');
  });

  it("formatea 0 como '$0'", () => {
    // Arrange / Act
    const result = formatCOP(0);
    // Assert
    expect(result).toBe('$0');
  });

  it('redondea decimales', () => {
    // Arrange / Act
    const result = formatCOP(1500.7);
    // Assert — Math.round(1500.7) = 1501 → '$1.501'
    expect(result).toBe('$1.501');
  });

  it('formatea número grande correctamente', () => {
    // Arrange / Act
    const result = formatCOP(1000000);
    // Assert
    expect(result).toBe('$1.000.000');
  });
});

describe('formatHora', () => {
  it('retorna HH:mm para ISO string conocido', () => {
    // Arrange — 2026-05-08T14:30:00Z = 09:30 en Bogotá (UTC-5)
    const iso = '2026-05-08T14:30:00Z';
    // Act
    const result = formatHora(iso);
    // Assert
    expect(result).toBe('09:30');
  });

  it('aplica zona Colombia', () => {
    // Arrange — medianoche UTC = 19:00 del día anterior en Bogotá
    const iso = '2026-05-09T00:00:00Z';
    // Act
    const result = formatHora(iso);
    // Assert
    expect(result).toBe('19:00');
  });
});

describe('formatFecha', () => {
  it('retorna dd/mm/yyyy para ISO string conocido', () => {
    // Arrange
    const iso = '2026-05-08T10:00:00Z';
    // Act
    const result = formatFecha(iso);
    // Assert
    expect(result).toBe('08/05/2026');
  });
});

describe('colDateStr', () => {
  it('retorna YYYY-MM-DD', () => {
    // Arrange / Act
    const result = colDateStr(new Date('2026-05-08T10:00:00Z'));
    // Assert
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe('2026-05-08');
  });

  it('acepta string ISO, Date y timestamp', () => {
    // Arrange
    const isoStr = '2026-05-08T10:00:00Z';
    const date = new Date(isoStr);
    const ts = date.getTime();
    // Act
    const fromString = colDateStr(isoStr);
    const fromDate = colDateStr(date);
    const fromTs = colDateStr(ts);
    // Assert
    expect(fromString).toBe('2026-05-08');
    expect(fromDate).toBe('2026-05-08');
    expect(fromTs).toBe('2026-05-08');
  });
});

describe('colStartOfDay', () => {
  it('retorna medianoche en Colombia', () => {
    // Arrange — 2026-05-08 en Bogotá
    const input = '2026-05-08T10:00:00Z';
    // Act
    const result = colStartOfDay(input);
    // Assert — medianoche Bogotá 2026-05-08 = 05:00 UTC
    expect(result.getTime()).toBe(new Date('2026-05-08T05:00:00Z').getTime());
  });
});

describe('colStartOfMonth', () => {
  it('retorna el primer día del mes en Colombia a medianoche', () => {
    // Arrange
    const input = '2026-05-15T10:00:00Z';
    // Act
    const result = colStartOfMonth(input);
    // Assert — primer día del mes mayo 2026 en Bogotá = 2026-05-01T00:00:00-05:00 = 2026-05-01T05:00:00Z
    expect(result.getTime()).toBe(new Date('2026-05-01T05:00:00Z').getTime());
  });
});
