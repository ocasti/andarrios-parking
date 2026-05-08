import { describe, it, expect } from 'vitest';
import { MesKey } from '../MesKey';

describe('MesKey', () => {
  describe('parse', () => {
    it('acepta formato válido "2026-05"', () => {
      // Arrange
      const s = '2026-05';
      // Act
      const mes = MesKey.parse(s);
      // Assert
      expect(mes.value).toBe('2026-05');
    });

    it('acepta formato válido "2024-12"', () => {
      // Arrange
      const s = '2024-12';
      // Act
      const mes = MesKey.parse(s);
      // Assert
      expect(mes.value).toBe('2024-12');
    });

    it('lanza con formato "2026-5" (mes sin cero a la izquierda)', () => {
      // Arrange
      const s = '2026-5';
      // Act & Assert
      expect(() => MesKey.parse(s)).toThrow('MesKey inválido');
    });

    it('lanza con formato "05-2026" (mes y año invertidos)', () => {
      // Arrange
      const s = '05-2026';
      // Act & Assert
      expect(() => MesKey.parse(s)).toThrow('MesKey inválido');
    });

    it('lanza con string vacío', () => {
      // Arrange
      const s = '';
      // Act & Assert
      expect(() => MesKey.parse(s)).toThrow('MesKey inválido');
    });

    it('lanza con null', () => {
      // Arrange / Act & Assert
      expect(() => MesKey.parse(null as unknown as string)).toThrow('MesKey inválido');
    });

    it('lanza con formato "202605" (sin guión)', () => {
      // Arrange
      const s = '202605';
      // Act & Assert
      expect(() => MesKey.parse(s)).toThrow('MesKey inválido');
    });
  });

  describe('fromDate', () => {
    it('retorna el mes correcto para una fecha conocida (2026-05-08 UTC)', () => {
      // Arrange — fecha en UTC que es mayo en Bogotá
      const date = new Date('2026-05-08T10:00:00Z');
      // Act
      const mes = MesKey.fromDate(date);
      // Assert
      expect(mes.value).toBe('2026-05');
    });

    it('retorna el mes correcto para enero 2025', () => {
      // Arrange
      const date = new Date('2025-01-15T15:00:00Z');
      // Act
      const mes = MesKey.fromDate(date);
      // Assert
      expect(mes.value).toBe('2025-01');
    });
  });

  describe('current', () => {
    it('retorna formato YYYY-MM válido', () => {
      // Arrange / Act
      const mes = MesKey.current();
      // Assert
      expect(mes.value).toMatch(/^\d{4}-\d{2}$/);
    });

    it('el valor de current corresponde al mes actual en Colombia', () => {
      // Arrange
      const now = new Date();
      const expected = MesKey.fromDate(now);
      // Act
      const current = MesKey.current();
      // Assert
      expect(current.value).toBe(expected.value);
    });
  });

  describe('label', () => {
    it('retorna string no vacío para "2026-05"', () => {
      // Arrange
      const mes = MesKey.parse('2026-05');
      // Act
      const result = mes.label();
      // Assert
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('retorna nombre en español para mayo 2026', () => {
      // Arrange
      const mes = MesKey.parse('2026-05');
      // Act
      const result = mes.label();
      // Assert
      expect(result.toLowerCase()).toContain('mayo');
    });

    it('retorna el año en el label', () => {
      // Arrange
      const mes = MesKey.parse('2026-05');
      // Act
      const result = mes.label();
      // Assert
      expect(result).toContain('2026');
    });
  });

  describe('toString', () => {
    it('retorna el string YYYY-MM del mes', () => {
      // Arrange
      const mes = MesKey.parse('2026-05');
      // Act
      const result = mes.toString();
      // Assert
      expect(result).toBe('2026-05');
    });
  });

  describe('equals', () => {
    it('retorna true para el mismo mes', () => {
      // Arrange
      const a = MesKey.parse('2026-05');
      const b = MesKey.parse('2026-05');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(true);
    });

    it('retorna false para meses diferentes', () => {
      // Arrange
      const a = MesKey.parse('2026-05');
      const b = MesKey.parse('2026-06');
      // Act
      const result = a.equals(b);
      // Assert
      expect(result).toBe(false);
    });
  });
});
