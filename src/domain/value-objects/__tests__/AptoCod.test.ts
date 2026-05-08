import { describe, it, expect } from 'vitest';
import { AptoCod } from '../AptoCod';

describe('AptoCod', () => {
  describe('parse', () => {
    it('acepta formato válido T01-101', () => {
      // Arrange
      const cod = 'T01-101';
      // Act
      const apto = AptoCod.parse(cod);
      // Assert
      expect(apto.value).toBe('T01-101');
    });

    it('acepta formato válido con diferentes números T12-604', () => {
      // Arrange
      const cod = 'T12-604';
      // Act
      const apto = AptoCod.parse(cod);
      // Assert
      expect(apto.value).toBe('T12-604');
    });

    it('lanza con formato inválido T1-101 (torre sin cero a la izquierda)', () => {
      // Arrange
      const cod = 'T1-101';
      // Act & Assert
      expect(() => AptoCod.parse(cod)).toThrow('AptoCod inválido');
    });

    it('lanza con formato inválido T01101 (sin guión)', () => {
      // Arrange
      const cod = 'T01101';
      // Act & Assert
      expect(() => AptoCod.parse(cod)).toThrow('AptoCod inválido');
    });

    it('lanza con formato vacío', () => {
      // Arrange
      const cod = '';
      // Act & Assert
      expect(() => AptoCod.parse(cod)).toThrow('AptoCod inválido');
    });

    it('lanza con formato en minúsculas t01-101', () => {
      // Arrange
      const cod = 't01-101';
      // Act & Assert
      expect(() => AptoCod.parse(cod)).toThrow('AptoCod inválido');
    });

    it('lanza con null', () => {
      // Arrange / Act & Assert
      expect(() => AptoCod.parse(null as unknown as string)).toThrow('AptoCod inválido');
    });
  });

  describe('fromParts', () => {
    it('genera el código correcto con torre=1, piso=1, apto=1 → "T01-101"', () => {
      // Arrange / Act
      const apto = AptoCod.fromParts(1, 1, 1);
      // Assert
      expect(apto.value).toBe('T01-101');
    });

    it('genera el código correcto con torre=1, piso=3, apto=2 → "T01-302"', () => {
      // Arrange / Act
      const apto = AptoCod.fromParts(1, 3, 2);
      // Assert
      expect(apto.value).toBe('T01-302');
    });

    it('genera el código correcto con torre=12, piso=6, apto=4 → "T12-604"', () => {
      // Arrange / Act
      const apto = AptoCod.fromParts(12, 6, 4);
      // Assert
      expect(apto.value).toBe('T12-604');
    });
  });

  describe('getters', () => {
    it('getter torre retorna el número de torre correcto', () => {
      // Arrange
      const apto = AptoCod.parse('T05-302');
      // Act & Assert
      expect(apto.torre).toBe(5);
    });

    it('getter piso retorna el número de piso correcto', () => {
      // Arrange
      const apto = AptoCod.parse('T05-302');
      // Act & Assert
      expect(apto.piso).toBe(3);
    });

    it('getter apto retorna el número de apartamento correcto', () => {
      // Arrange
      const apto = AptoCod.parse('T05-302');
      // Act & Assert
      expect(apto.apto).toBe(2);
    });
  });

  describe('toString', () => {
    it('retorna el string correcto del código', () => {
      // Arrange
      const apto = AptoCod.parse('T01-101');
      // Act
      const result = apto.toString();
      // Assert
      expect(result).toBe('T01-101');
    });
  });

  describe('equals', () => {
    it('retorna true para el mismo código de apartamento', () => {
      // Arrange
      const a = AptoCod.parse('T01-101');
      const b = AptoCod.parse('T01-101');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(true);
    });

    it('retorna false para códigos de apartamento diferentes', () => {
      // Arrange
      const a = AptoCod.parse('T01-101');
      const b = AptoCod.parse('T02-202');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(false);
    });
  });
});
