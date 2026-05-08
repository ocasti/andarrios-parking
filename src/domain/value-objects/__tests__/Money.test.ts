import { describe, it, expect } from 'vitest';
import { Money } from '../Money';

describe('Money', () => {
  describe('of', () => {
    it('accepts a positive value', () => {
      // Arrange / Act
      const m = Money.of(1500);
      // Assert
      expect(m.amount).toBe(1500);
    });

    it('accepts zero value', () => {
      // Arrange / Act
      const m = Money.of(0);
      // Assert
      expect(m.amount).toBe(0);
    });

    it('throws with negative value', () => {
      // Arrange / Act & Assert
      expect(() => Money.of(-1)).toThrow('invalid Money');
    });

    it('throws with NaN', () => {
      // Arrange / Act & Assert
      expect(() => Money.of(NaN)).toThrow('invalid Money');
    });

    it('rounds decimals to nearest integer', () => {
      // Arrange / Act
      const m = Money.of(1500.7);
      // Assert
      expect(m.amount).toBe(1501);
    });
  });

  describe('zero', () => {
    it('returns an amount of 0', () => {
      // Arrange / Act
      const m = Money.zero();
      // Assert
      expect(m.amount).toBe(0);
    });

    it('isZero returns true for zero()', () => {
      // Arrange / Act
      const m = Money.zero();
      // Assert
      expect(m.isZero()).toBe(true);
    });
  });

  describe('add', () => {
    it('correctly adds two amounts', () => {
      // Arrange
      const a = Money.of(1000);
      const b = Money.of(500);
      // Act
      const result = a.add(b);
      // Assert
      expect(result.amount).toBe(1500);
    });

    it('adding zero returns the same value', () => {
      // Arrange
      const a = Money.of(2000);
      const b = Money.zero();
      // Act
      const result = a.add(b);
      // Assert
      expect(result.amount).toBe(2000);
    });
  });

  describe('multiply', () => {
    it('correctly multiplies by a positive factor', () => {
      // Arrange
      const m = Money.of(1000);
      // Act
      const result = m.multiply(3);
      // Assert
      expect(result.amount).toBe(3000);
    });

    it('multiplies and rounds the result', () => {
      // Arrange
      const m = Money.of(1000);
      // Act
      const result = m.multiply(1.5);
      // Assert
      expect(result.amount).toBe(1500);
    });

    it('multiplying by 0 gives zero', () => {
      // Arrange
      const m = Money.of(1000);
      // Act
      const result = m.multiply(0);
      // Assert
      expect(result.amount).toBe(0);
    });

    it('throws with negative factor', () => {
      // Arrange
      const m = Money.of(1000);
      // Act & Assert
      expect(() => m.multiply(-1)).toThrow('invalid factor');
    });
  });

  describe('subtract', () => {
    it('correctly subtracts two amounts', () => {
      // Arrange
      const a = Money.of(2000);
      const b = Money.of(500);
      // Act
      const result = a.subtract(b);
      // Assert
      expect(result.amount).toBe(1500);
    });

    it('subtraction resulting in zero', () => {
      // Arrange
      const a = Money.of(1000);
      const b = Money.of(1000);
      // Act
      const result = a.subtract(b);
      // Assert
      expect(result.amount).toBe(0);
    });

    it('throws if result would be negative', () => {
      // Arrange
      const a = Money.of(500);
      const b = Money.of(1000);
      // Act & Assert
      expect(() => a.subtract(b)).toThrow('negative result');
    });
  });

  describe('format', () => {
    it('returns string with COP format for 1500', () => {
      // Arrange
      const m = Money.of(1500);
      // Act
      const result = m.format();
      // Assert
      expect(result).toContain('1.500');
    });

    it('returns string that includes the currency symbol', () => {
      // Arrange
      const m = Money.of(1500);
      // Act
      const result = m.format();
      // Assert
      expect(result).toContain('$');
    });
  });

  describe('equals', () => {
    it('returns true for the same amount', () => {
      // Arrange
      const a = Money.of(1000);
      const b = Money.of(1000);
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(true);
    });

    it('returns false for different amounts', () => {
      // Arrange
      const a = Money.of(1000);
      const b = Money.of(2000);
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isZero', () => {
    it('returns true only for zero amount', () => {
      // Arrange
      const m = Money.of(0);
      // Act & Assert
      expect(m.isZero()).toBe(true);
    });

    it('returns false for amount greater than zero', () => {
      // Arrange
      const m = Money.of(1);
      // Act & Assert
      expect(m.isZero()).toBe(false);
    });
  });
});
