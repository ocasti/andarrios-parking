import { describe, it, expect } from 'vitest';
import { ApartmentCode } from '../ApartmentCode';

describe('ApartmentCode', () => {
  describe('parse', () => {
    it('accepts valid format T01-101', () => {
      // Arrange
      const cod = 'T01-101';
      // Act
      const apto = ApartmentCode.parse(cod);
      // Assert
      expect(apto.value).toBe('T01-101');
    });

    it('accepts valid format with different numbers T12-604', () => {
      // Arrange
      const cod = 'T12-604';
      // Act
      const apto = ApartmentCode.parse(cod);
      // Assert
      expect(apto.value).toBe('T12-604');
    });

    it('throws with invalid format T1-101 (tower without leading zero)', () => {
      // Arrange
      const cod = 'T1-101';
      // Act & Assert
      expect(() => ApartmentCode.parse(cod)).toThrow('invalid ApartmentCode');
    });

    it('throws with invalid format T01101 (missing hyphen)', () => {
      // Arrange
      const cod = 'T01101';
      // Act & Assert
      expect(() => ApartmentCode.parse(cod)).toThrow('invalid ApartmentCode');
    });

    it('throws with empty format', () => {
      // Arrange
      const cod = '';
      // Act & Assert
      expect(() => ApartmentCode.parse(cod)).toThrow('invalid ApartmentCode');
    });

    it('throws with lowercase format t01-101', () => {
      // Arrange
      const cod = 't01-101';
      // Act & Assert
      expect(() => ApartmentCode.parse(cod)).toThrow('invalid ApartmentCode');
    });

    it('throws with null', () => {
      // Arrange / Act & Assert
      expect(() => ApartmentCode.parse(null as unknown as string)).toThrow('invalid ApartmentCode');
    });
  });

  describe('fromParts', () => {
    it('generates correct code with tower=1, floor=1, unit=1 → "T01-101"', () => {
      // Arrange / Act
      const apto = ApartmentCode.fromParts(1, 1, 1);
      // Assert
      expect(apto.value).toBe('T01-101');
    });

    it('generates correct code with tower=1, floor=3, unit=2 → "T01-302"', () => {
      // Arrange / Act
      const apto = ApartmentCode.fromParts(1, 3, 2);
      // Assert
      expect(apto.value).toBe('T01-302');
    });

    it('generates correct code with tower=12, floor=6, unit=4 → "T12-604"', () => {
      // Arrange / Act
      const apto = ApartmentCode.fromParts(12, 6, 4);
      // Assert
      expect(apto.value).toBe('T12-604');
    });
  });

  describe('getters', () => {
    it('getter tower returns correct tower number', () => {
      // Arrange
      const apto = ApartmentCode.parse('T05-302');
      // Act & Assert
      expect(apto.tower).toBe(5);
    });

    it('getter floor returns correct floor number', () => {
      // Arrange
      const apto = ApartmentCode.parse('T05-302');
      // Act & Assert
      expect(apto.floor).toBe(3);
    });

    it('getter unit returns correct unit number', () => {
      // Arrange
      const apto = ApartmentCode.parse('T05-302');
      // Act & Assert
      expect(apto.unit).toBe(2);
    });
  });

  describe('toString', () => {
    it('returns correct code string', () => {
      // Arrange
      const apto = ApartmentCode.parse('T01-101');
      // Act
      const result = apto.toString();
      // Assert
      expect(result).toBe('T01-101');
    });
  });

  describe('equals', () => {
    it('returns true for same apartment code', () => {
      // Arrange
      const a = ApartmentCode.parse('T01-101');
      const b = ApartmentCode.parse('T01-101');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(true);
    });

    it('returns false for different apartment codes', () => {
      // Arrange
      const a = ApartmentCode.parse('T01-101');
      const b = ApartmentCode.parse('T02-202');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(false);
    });
  });
});
