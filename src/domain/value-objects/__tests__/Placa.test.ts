import { describe, it, expect } from 'vitest';
import { Placa } from '../Placa';

describe('Placa', () => {
  describe('parse', () => {
    it('parsea y normaliza a mayúsculas correctamente', () => {
      // Arrange
      const raw = 'abc123';
      // Act
      const placa = Placa.parse(raw);
      // Assert
      expect(placa.value).toBe('ABC123');
    });

    it('elimina espacios antes y después', () => {
      // Arrange
      const raw = '  ABC123  ';
      // Act
      const placa = Placa.parse(raw);
      // Assert
      expect(placa.value).toBe('ABC123');
    });

    it('elimina espacios internos', () => {
      // Arrange
      const raw = ' ab c 12 3 ';
      // Act
      const placa = Placa.parse(raw);
      // Assert
      expect(placa.value).toBe('ABC123');
    });

    it('lanza error si está vacía', () => {
      // Arrange
      const raw = '';
      // Act & Assert
      expect(() => Placa.parse(raw)).toThrow('Placa inválida');
    });

    it('lanza error si solo contiene espacios', () => {
      // Arrange
      const raw = '   ';
      // Act & Assert
      expect(() => Placa.parse(raw)).toThrow('Placa inválida');
    });

    it('lanza error si es null', () => {
      // Arrange / Act & Assert
      expect(() => Placa.parse(null as unknown as string)).toThrow('Placa inválida');
    });

    it('lanza error si es undefined', () => {
      // Arrange / Act & Assert
      expect(() => Placa.parse(undefined as unknown as string)).toThrow('Placa inválida');
    });
  });

  describe('equals', () => {
    it('retorna true para la misma placa', () => {
      // Arrange
      const a = Placa.parse('ABC123');
      const b = Placa.parse('abc123');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(true);
    });

    it('retorna false para placas diferentes', () => {
      // Arrange
      const a = Placa.parse('ABC123');
      const b = Placa.parse('XYZ999');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(false);
    });
  });

  describe('toString', () => {
    it('retorna el valor normalizado de la placa', () => {
      // Arrange
      const placa = Placa.parse('abc123');
      // Act
      const result = placa.toString();
      // Assert
      expect(result).toBe('ABC123');
    });
  });
});
