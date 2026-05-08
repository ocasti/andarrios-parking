import { describe, it, expect } from 'vitest';
import { calcularCobro } from '../CobroService';

describe('calcularCobro', () => {
  it('cobra 0 cuando el tiempo es menor que horas gratis con cortesía', () => {
    // Arrange
    const params = { horas: 1.5, tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19, cortesiaAplica: true };
    // Act
    const result = calcularCobro(params);
    // Assert
    expect(result.horasCobradas).toBe(0);
    expect(result.base).toBe(0);
    expect(result.iva).toBe(0);
    expect(result.total).toBe(0);
  });

  it('cobra 0 cuando el tiempo es exactamente igual a horas gratis', () => {
    // Arrange
    const params = { horas: 2, tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19, cortesiaAplica: true };
    // Act
    const result = calcularCobro(params);
    // Assert
    expect(result.horasCobradas).toBe(0);
    expect(result.base).toBe(0);
    expect(result.total).toBe(0);
  });

  it('cobra 1 hora cuando supera por fracción las horas gratis (ceil)', () => {
    // Arrange — 2.1h con 2h gratis → 0.1h cobrada → ceil = 1
    const params = { horas: 2.1, tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19, cortesiaAplica: true };
    // Act
    const result = calcularCobro(params);
    // Assert
    expect(result.horasCobradas).toBe(1);
    expect(result.base).toBe(1000);
  });

  it('cobra hora completa adicional aunque solo pasó 0.1h extra', () => {
    // Arrange — mismo caso que el anterior, verificando que ceil funciona
    const params = { horas: 3.1, tarifaHora: 500, horasGratis: 2, porcentajeIva: 19, cortesiaAplica: true };
    // Act
    const result = calcularCobro(params);
    // Assert
    // 3.1 - 2 = 1.1 → ceil = 2
    expect(result.horasCobradas).toBe(2);
    expect(result.base).toBe(1000);
  });

  it('cobra desde la primera hora cuando no aplica cortesía', () => {
    // Arrange — 1h sin cortesía → cobra 1h (horasGratis ignoradas)
    const params = { horas: 1.0, tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19, cortesiaAplica: false };
    // Act
    const result = calcularCobro(params);
    // Assert
    expect(result.horasCobradas).toBe(1);
    expect(result.base).toBe(1000);
  });

  it('cobra correctamente con 3 horas y tarifa de 1000', () => {
    // Arrange — 3h con 2h gratis → 1h cobrada a $1000
    const params = { horas: 3, tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19, cortesiaAplica: true };
    // Act
    const result = calcularCobro(params);
    // Assert
    expect(result.horasCobradas).toBe(1);
    expect(result.base).toBe(1000);
  });

  it('calcula IVA correctamente sobre la base', () => {
    // Arrange — 3h con 2h gratis, tarifa=2000 → base=2000, iva=Math.round(2000*19/119)
    const params = { horas: 3, tarifaHora: 2000, horasGratis: 2, porcentajeIva: 19, cortesiaAplica: true };
    // Act
    const result = calcularCobro(params);
    // Assert
    expect(result.horasCobradas).toBe(1);
    expect(result.base).toBe(2000);
    expect(result.iva).toBe(Math.round(2000 * 19 / 119));
    expect(result.total).toBe(2000);
  });

  it('retorna horasGratis=0 cuando cortesiaAplica=false', () => {
    // Arrange
    const params = { horas: 3, tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19, cortesiaAplica: false };
    // Act
    const result = calcularCobro(params);
    // Assert
    expect(result.horasGratis).toBe(0);
  });

  it('retorna horasGratis correcto cuando cortesiaAplica=true', () => {
    // Arrange
    const params = { horas: 3, tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19, cortesiaAplica: true };
    // Act
    const result = calcularCobro(params);
    // Assert
    expect(result.horasGratis).toBe(2);
  });

  it('maneja 0 horas sin error', () => {
    // Arrange
    const params = { horas: 0, tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19, cortesiaAplica: true };
    // Act
    const result = calcularCobro(params);
    // Assert
    expect(result.horasCobradas).toBe(0);
    expect(result.base).toBe(0);
    expect(result.total).toBe(0);
  });

  it('maneja horas negativas como 0 cobrado', () => {
    // Arrange
    const params = { horas: -1, tarifaHora: 1000, horasGratis: 2, porcentajeIva: 19, cortesiaAplica: true };
    // Act
    const result = calcularCobro(params);
    // Assert
    expect(result.horasCobradas).toBe(0);
    expect(result.base).toBe(0);
    expect(result.total).toBe(0);
  });
});
