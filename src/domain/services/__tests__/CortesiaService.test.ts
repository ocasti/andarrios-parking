import { describe, it, expect } from 'vitest';
import { evaluarCortesia, calcularDesde } from '../CortesiaService';

describe('evaluarCortesia', () => {
  it('aplica cortesía cuando no hay historial reciente', () => {
    // Arrange
    const historial: { salidaAt: string }[] = [];
    // Act
    const result = evaluarCortesia(historial, 6);
    // Assert
    expect(result).toBe(true);
  });

  it('no aplica cortesía cuando hay una salida reciente', () => {
    // Arrange
    const historial = [{ salidaAt: new Date().toISOString() }];
    // Act
    const result = evaluarCortesia(historial, 6);
    // Assert
    expect(result).toBe(false);
  });

  it('no aplica cortesía cuando hay múltiples salidas recientes', () => {
    // Arrange
    const now = new Date().toISOString();
    const historial = [
      { salidaAt: now },
      { salidaAt: now },
    ];
    // Act
    const result = evaluarCortesia(historial, 6);
    // Assert
    expect(result).toBe(false);
  });

  it('siempre aplica cortesía cuando horasMinRecortesia es 0', () => {
    // Arrange — aunque haya historial reciente, con 0h siempre aplica
    const historial = [{ salidaAt: new Date().toISOString() }];
    // Act
    const result = evaluarCortesia(historial, 0);
    // Assert
    expect(result).toBe(true);
  });

  it('siempre aplica cortesía cuando horasMinRecortesia es negativo', () => {
    // Arrange
    const historial = [{ salidaAt: new Date().toISOString() }];
    // Act
    const result = evaluarCortesia(historial, -3);
    // Assert
    expect(result).toBe(true);
  });
});

describe('calcularDesde', () => {
  it('retorna fecha correcta restando las horas indicadas', () => {
    // Arrange
    const ahora = new Date('2026-05-08T12:00:00Z');
    const horas = 3;
    // Act
    const resultado = calcularDesde(horas, ahora);
    // Assert
    const esperado = new Date('2026-05-08T09:00:00Z');
    expect(resultado.getTime()).toBe(esperado.getTime());
  });

  it('retorna fecha 6 horas atrás para horasMin=6', () => {
    // Arrange
    const ahora = new Date('2026-05-08T18:00:00Z');
    // Act
    const resultado = calcularDesde(6, ahora);
    // Assert
    const esperado = new Date('2026-05-08T12:00:00Z');
    expect(resultado.getTime()).toBe(esperado.getTime());
  });
});
