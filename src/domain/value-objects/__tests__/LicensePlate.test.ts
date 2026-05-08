import { describe, it, expect } from 'vitest';
import { LicensePlate } from '../LicensePlate';

describe('LicensePlate', () => {
  describe('parse', () => {
    it('parses and normalizes to uppercase correctly', () => {
      // Arrange
      const raw = 'abc123';
      // Act
      const plate = LicensePlate.parse(raw);
      // Assert
      expect(plate.value).toBe('ABC123');
    });

    it('removes leading and trailing spaces', () => {
      // Arrange
      const raw = '  ABC123  ';
      // Act
      const plate = LicensePlate.parse(raw);
      // Assert
      expect(plate.value).toBe('ABC123');
    });

    it('removes internal spaces', () => {
      // Arrange
      const raw = ' ab c 12 3 ';
      // Act
      const plate = LicensePlate.parse(raw);
      // Assert
      expect(plate.value).toBe('ABC123');
    });

    it('throws error if empty', () => {
      // Arrange
      const raw = '';
      // Act & Assert
      expect(() => LicensePlate.parse(raw)).toThrow('invalid LicensePlate');
    });

    it('throws error if only spaces', () => {
      // Arrange
      const raw = '   ';
      // Act & Assert
      expect(() => LicensePlate.parse(raw)).toThrow('invalid LicensePlate');
    });

    it('throws error if null', () => {
      // Arrange / Act & Assert
      expect(() => LicensePlate.parse(null as unknown as string)).toThrow('invalid LicensePlate');
    });

    it('throws error if undefined', () => {
      // Arrange / Act & Assert
      expect(() => LicensePlate.parse(undefined as unknown as string)).toThrow('invalid LicensePlate');
    });
  });

  describe('equals', () => {
    it('returns true for the same plate', () => {
      // Arrange
      const a = LicensePlate.parse('ABC123');
      const b = LicensePlate.parse('abc123');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(true);
    });

    it('returns false for different plates', () => {
      // Arrange
      const a = LicensePlate.parse('ABC123');
      const b = LicensePlate.parse('XYZ999');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('returns normalized plate value', () => {
      // Arrange
      const plate = LicensePlate.parse('abc123');
      // Act
      const result = plate.toString();
      // Assert
      expect(result).toBe('ABC123');
    });
  });
});
