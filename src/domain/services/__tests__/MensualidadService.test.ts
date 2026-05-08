import { describe, it, expect } from 'vitest';
import { calculateMonthlyAmount, generateMonthKey, isSameMonth } from '../MensualidadService';
import type { MonthlyRateConfig } from '../MensualidadService';

describe('calculateMonthlyAmount', () => {
  it('returns carMonthlyRate for vehicle type car', () => {
    // Arrange
    const config: MonthlyRateConfig = { carMonthlyRate: 25000, motorcycleMonthlyRate: 12000 };
    // Act
    const result = calculateMonthlyAmount('car', config);
    // Assert
    expect(result).toBe(25000);
  });

  it('returns motorcycleMonthlyRate for vehicle type motorcycle', () => {
    // Arrange
    const config: MonthlyRateConfig = { carMonthlyRate: 25000, motorcycleMonthlyRate: 12000 };
    // Act
    const result = calculateMonthlyAmount('motorcycle', config);
    // Assert
    expect(result).toBe(12000);
  });

  it('with pricing { carMonthlyRate:25000, motorcycleMonthlyRate:12000 } → car=25000, motorcycle=12000', () => {
    // Arrange
    const config: MonthlyRateConfig = { carMonthlyRate: 25000, motorcycleMonthlyRate: 12000 };
    // Act & Assert
    expect(calculateMonthlyAmount('car', config)).toBe(25000);
    expect(calculateMonthlyAmount('motorcycle', config)).toBe(12000);
  });
});

describe('generateMonthKey', () => {
  it('returns YYYY-MM format', () => {
    // Arrange / Act
    const result = generateMonthKey(new Date());
    // Assert
    expect(result).toMatch(/^\d{4}-\d{2}$/);
  });

  it('returns correct month for a known date', () => {
    // Arrange — 2026-05-08 10:00 UTC = 2026-05-08 05:00 in Bogotá → month 2026-05
    const date = new Date('2026-05-08T10:00:00Z');
    // Act
    const result = generateMonthKey(date);
    // Assert
    expect(result).toBe('2026-05');
  });

  it('without parameter returns the current month', () => {
    // Arrange
    const now = new Date();
    const ymdFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const expected = ymdFormatter.format(now).slice(0, 7);
    // Act
    const result = generateMonthKey();
    // Assert
    expect(result).toBe(expected);
  });
});

describe('isSameMonth', () => {
  it('returns true for matching keys', () => {
    // Arrange / Act
    const result = isSameMonth('2026-05', '2026-05');
    // Assert
    expect(result).toBe(true);
  });

  it('returns false for different keys', () => {
    // Arrange / Act
    const result = isSameMonth('2026-05', '2026-06');
    // Assert
    expect(result).toBe(false);
  });

  it('returns false for different year same month', () => {
    // Arrange / Act
    const result = isSameMonth('2025-05', '2026-05');
    // Assert
    expect(result).toBe(false);
  });
});
