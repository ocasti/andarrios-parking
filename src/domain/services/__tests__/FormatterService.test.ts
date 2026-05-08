import { describe, it, expect } from 'vitest';
import {
  formatCOP,
  formatTime,
  formatDate,
  colombiaDateStr,
  colombiaStartOfDay,
  colombiaStartOfMonth,
} from '../FormatterService';

describe('formatCOP', () => {
  it("formats 1500 as '$1.500'", () => {
    // Arrange / Act
    const result = formatCOP(1500);
    // Assert
    expect(result).toBe('$1.500');
  });

  it("formats 0 as '$0'", () => {
    // Arrange / Act
    const result = formatCOP(0);
    // Assert
    expect(result).toBe('$0');
  });

  it('rounds decimals', () => {
    // Arrange / Act
    const result = formatCOP(1500.7);
    // Assert — Math.round(1500.7) = 1501 → '$1.501'
    expect(result).toBe('$1.501');
  });

  it('formats large number correctly', () => {
    // Arrange / Act
    const result = formatCOP(1000000);
    // Assert
    expect(result).toBe('$1.000.000');
  });
});

describe('formatTime', () => {
  it('returns HH:mm for a known ISO string', () => {
    // Arrange — 2026-05-08T14:30:00Z = 09:30 in Bogotá (UTC-5)
    const iso = '2026-05-08T14:30:00Z';
    // Act
    const result = formatTime(iso);
    // Assert
    expect(result).toBe('09:30');
  });

  it('applies Colombia timezone', () => {
    // Arrange — midnight UTC = 19:00 of the previous day in Bogotá
    const iso = '2026-05-09T00:00:00Z';
    // Act
    const result = formatTime(iso);
    // Assert
    expect(result).toBe('19:00');
  });
});

describe('formatDate', () => {
  it('returns dd/mm/yyyy for a known ISO string', () => {
    // Arrange
    const iso = '2026-05-08T10:00:00Z';
    // Act
    const result = formatDate(iso);
    // Assert
    expect(result).toBe('08/05/2026');
  });
});

describe('colombiaDateStr', () => {
  it('returns YYYY-MM-DD', () => {
    // Arrange / Act
    const result = colombiaDateStr(new Date('2026-05-08T10:00:00Z'));
    // Assert
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe('2026-05-08');
  });

  it('accepts ISO string, Date and timestamp', () => {
    // Arrange
    const isoStr = '2026-05-08T10:00:00Z';
    const date = new Date(isoStr);
    const ts = date.getTime();
    // Act
    const fromString = colombiaDateStr(isoStr);
    const fromDate = colombiaDateStr(date);
    const fromTs = colombiaDateStr(ts);
    // Assert
    expect(fromString).toBe('2026-05-08');
    expect(fromDate).toBe('2026-05-08');
    expect(fromTs).toBe('2026-05-08');
  });
});

describe('colombiaStartOfDay', () => {
  it('returns midnight in Colombia', () => {
    // Arrange — 2026-05-08 in Bogotá
    const input = '2026-05-08T10:00:00Z';
    // Act
    const result = colombiaStartOfDay(input);
    // Assert — midnight Bogotá 2026-05-08 = 05:00 UTC
    expect(result.getTime()).toBe(new Date('2026-05-08T05:00:00Z').getTime());
  });
});

describe('colombiaStartOfMonth', () => {
  it('returns first day of the month in Colombia at midnight', () => {
    // Arrange
    const input = '2026-05-15T10:00:00Z';
    // Act
    const result = colombiaStartOfMonth(input);
    // Assert — first day of May 2026 in Bogotá = 2026-05-01T00:00:00-05:00 = 2026-05-01T05:00:00Z
    expect(result.getTime()).toBe(new Date('2026-05-01T05:00:00Z').getTime());
  });
});
