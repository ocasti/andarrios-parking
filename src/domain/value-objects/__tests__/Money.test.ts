import { describe, it, expect } from 'vitest';
import { Money } from '../Money';

describe('Money', () => {
  describe('of', () => {
    it('acepta un valor positivo', () => {
      // Arrange / Act
      const m = Money.of(1500);
      // Assert
      expect(m.amount).toBe(1500);
    });

    it('acepta el valor cero', () => {
      // Arrange / Act
      const m = Money.of(0);
      // Assert
      expect(m.amount).toBe(0);
    });

    it('lanza con valor negativo', () => {
      // Arrange / Act & Assert
      expect(() => Money.of(-1)).toThrow('Money inválido');
    });

    it('lanza con NaN', () => {
      // Arrange / Act & Assert
      expect(() => Money.of(NaN)).toThrow('Money inválido');
    });

    it('redondea decimales al entero más cercano', () => {
      // Arrange / Act
      const m = Money.of(1500.7);
      // Assert
      expect(m.amount).toBe(1501);
    });
  });

  describe('zero', () => {
    it('retorna un monto de 0', () => {
      // Arrange / Act
      const m = Money.zero();
      // Assert
      expect(m.amount).toBe(0);
    });

    it('isZero retorna true para zero()', () => {
      // Arrange / Act
      const m = Money.zero();
      // Assert
      expect(m.isZero()).toBe(true);
    });
  });

  describe('add', () => {
    it('suma correctamente dos montos', () => {
      // Arrange
      const a = Money.of(1000);
      const b = Money.of(500);
      // Act
      const result = a.add(b);
      // Assert
      expect(result.amount).toBe(1500);
    });

    it('suma con cero da el mismo valor', () => {
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
    it('multiplica correctamente por un factor positivo', () => {
      // Arrange
      const m = Money.of(1000);
      // Act
      const result = m.multiply(3);
      // Assert
      expect(result.amount).toBe(3000);
    });

    it('multiplica y redondea el resultado', () => {
      // Arrange
      const m = Money.of(1000);
      // Act
      const result = m.multiply(1.5);
      // Assert
      expect(result.amount).toBe(1500);
    });

    it('multiplica por 0 da cero', () => {
      // Arrange
      const m = Money.of(1000);
      // Act
      const result = m.multiply(0);
      // Assert
      expect(result.amount).toBe(0);
    });

    it('lanza con factor negativo', () => {
      // Arrange
      const m = Money.of(1000);
      // Act & Assert
      expect(() => m.multiply(-1)).toThrow('factor inválido');
    });
  });

  describe('subtract', () => {
    it('resta correctamente dos montos', () => {
      // Arrange
      const a = Money.of(2000);
      const b = Money.of(500);
      // Act
      const result = a.subtract(b);
      // Assert
      expect(result.amount).toBe(1500);
    });

    it('resta que resulta en cero', () => {
      // Arrange
      const a = Money.of(1000);
      const b = Money.of(1000);
      // Act
      const result = a.subtract(b);
      // Assert
      expect(result.amount).toBe(0);
    });

    it('lanza si el resultado sería negativo', () => {
      // Arrange
      const a = Money.of(500);
      const b = Money.of(1000);
      // Act & Assert
      expect(() => a.subtract(b)).toThrow('resultado negativo');
    });
  });

  describe('format', () => {
    it('retorna string con formato COP para 1500', () => {
      // Arrange
      const m = Money.of(1500);
      // Act
      const result = m.format();
      // Assert
      expect(result).toContain('1.500');
    });

    it('retorna string que incluye el símbolo de moneda', () => {
      // Arrange
      const m = Money.of(1500);
      // Act
      const result = m.format();
      // Assert
      expect(result).toContain('$');
    });
  });

  describe('equals', () => {
    it('retorna true para el mismo monto', () => {
      // Arrange
      const a = Money.of(1000);
      const b = Money.of(1000);
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(true);
    });

    it('retorna false para montos diferentes', () => {
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
    it('retorna true solo para monto cero', () => {
      // Arrange
      const m = Money.of(0);
      // Act & Assert
      expect(m.isZero()).toBe(true);
    });

    it('retorna false para monto mayor a cero', () => {
      // Arrange
      const m = Money.of(1);
      // Act & Assert
      expect(m.isZero()).toBe(false);
    });
  });
});
