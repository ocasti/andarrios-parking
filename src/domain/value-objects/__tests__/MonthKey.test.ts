import { describe, it, expect } from 'vitest';
import { MonthKey } from '../MonthKey';

describe('MonthKey', () => {
  describe('parse', () => {
    it('accepts valid format "2026-05"', () => {
      // Arrange
      const s = '2026-05';
      // Act
      const month = MonthKey.parse(s);
      // Assert
      expect(month.value).toBe('2026-05');
    });

    it('accepts valid format "2024-12"', () => {
      // Arrange
      const s = '2024-12';
      // Act
      const month = MonthKey.parse(s);
      // Assert
      expect(month.value).toBe('2024-12');
    });

    it('throws with format "2026-5" (month without leading zero)', () => {
      // Arrange
      const s = '2026-5';
      // Act & Assert
      expect(() => MonthKey.parse(s)).toThrow('invalid MonthKey');
    });

    it('throws with format "05-2026" (month and year inverted)', () => {
      // Arrange
      const s = '05-2026';
      // Act & Assert
      expect(() => MonthKey.parse(s)).toThrow('invalid MonthKey');
    });

    it('throws with empty string', () => {
      // Arrange
      const s = '';
      // Act & Assert
      expect(() => MonthKey.parse(s)).toThrow('invalid MonthKey');
    });

    it('throws with null', () => {
      // Arrange / Act & Assert
      expect(() => MonthKey.parse(null as unknown as string)).toThrow('invalid MonthKey');
    });

    it('throws with format "202605" (missing hyphen)', () => {
      // Arrange
      const s = '202605';
      // Act & Assert
      expect(() => MonthKey.parse(s)).toThrow('invalid MonthKey');
    });
  });

  describe('fromDate', () => {
    it('returns correct month for a known date (2026-05-08 UTC)', () => {
      // Arrange — date in UTC that is May in Bogotá
      const date = new Date('2026-05-08T10:00:00Z');
      // Act
      const month = MonthKey.fromDate(date);
      // Assert
      expect(month.value).toBe('2026-05');
    });

    it('returns correct month for January 2025', () => {
      // Arrange
      const date = new Date('2025-01-15T15:00:00Z');
      // Act
      const month = MonthKey.fromDate(date);
      // Assert
      expect(month.value).toBe('2025-01');
    });
  });

  describe('current', () => {
    it('returns valid YYYY-MM format', () => {
      // Arrange / Act
      const month = MonthKey.current();
      // Assert
      expect(month.value).toMatch(/^\d{4}-\d{2}$/);
    });

    it('current value corresponds to the current month in Colombia', () => {
      // Arrange
      const now = new Date();
      const expected = MonthKey.fromDate(now);
      // Act
      const current = MonthKey.current();
      // Assert
      expect(current.value).toBe(expected.value);
    });
  });

  describe('label', () => {
    it('returns non-empty string for "2026-05"', () => {
      // Arrange
      const month = MonthKey.parse('2026-05');
      // Act
      const result = month.label();
      // Assert
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns Spanish label for May 2026', () => {
      // Arrange
      const month = MonthKey.parse('2026-05');
      // Act
      const result = month.label();
      // Assert
      expect(result.toLowerCase()).toContain('mayo');
    });

    it('returns the year in the label', () => {
      // Arrange
      const month = MonthKey.parse('2026-05');
      // Act
      const result = month.label();
      // Assert
      expect(result).toContain('2026');
    });
  });

  describe('toString', () => {
    it('returns the YYYY-MM string of the month', () => {
      // Arrange
      const month = MonthKey.parse('2026-05');
      // Act
      const result = month.toString();
      // Assert
      expect(result).toBe('2026-05');
    });
  });

  describe('equals', () => {
    it('returns true for the same month', () => {
      // Arrange
      const a = MonthKey.parse('2026-05');
      const b = MonthKey.parse('2026-05');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(true);
    });

    it('returns false for different months', () => {
      // Arrange
      const a = MonthKey.parse('2026-05');
      const b = MonthKey.parse('2026-06');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(false);
    });
  });
});
