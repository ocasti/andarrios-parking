import { describe, it, expect } from 'vitest';
import { calculateCharge } from '../CobroService';

describe('calculateCharge', () => {
  it('charges 0 when time is less than free hours with courtesy', () => {
    // Arrange
    const params = { hours: 1.5, hourlyRate: 1000, freeHours: 2, taxRate: 19, courtesyApplies: true };
    // Act
    const result = calculateCharge(params);
    // Assert
    expect(result.chargedHours).toBe(0);
    expect(result.base).toBe(0);
    expect(result.iva).toBe(0);
    expect(result.total).toBe(0);
  });

  it('charges 0 when time equals free hours exactly', () => {
    // Arrange
    const params = { hours: 2, hourlyRate: 1000, freeHours: 2, taxRate: 19, courtesyApplies: true };
    // Act
    const result = calculateCharge(params);
    // Assert
    expect(result.chargedHours).toBe(0);
    expect(result.base).toBe(0);
    expect(result.total).toBe(0);
  });

  it('charges 1 hour when free hours exceeded by a fraction (ceil)', () => {
    // Arrange — 2.1h with 2 free → 0.1h charged → ceil = 1
    const params = { hours: 2.1, hourlyRate: 1000, freeHours: 2, taxRate: 19, courtesyApplies: true };
    // Act
    const result = calculateCharge(params);
    // Assert
    expect(result.chargedHours).toBe(1);
    expect(result.base).toBe(1000);
  });

  it('charges full additional hour even if only 0.1h extra elapsed', () => {
    // Arrange — same case as above, verifying ceil works
    const params = { hours: 3.1, hourlyRate: 500, freeHours: 2, taxRate: 19, courtesyApplies: true };
    // Act
    const result = calculateCharge(params);
    // Assert
    // 3.1 - 2 = 1.1 → ceil = 2
    expect(result.chargedHours).toBe(2);
    expect(result.base).toBe(1000);
  });

  it('charges from first hour when courtesy does not apply', () => {
    // Arrange — 1h without courtesy → charges 1h (freeHours ignored)
    const params = { hours: 1.0, hourlyRate: 1000, freeHours: 2, taxRate: 19, courtesyApplies: false };
    // Act
    const result = calculateCharge(params);
    // Assert
    expect(result.chargedHours).toBe(1);
    expect(result.base).toBe(1000);
  });

  it('charges correctly with 3 hours at rate of 1000', () => {
    // Arrange — 3h with 2 free → 1h charged at $1000
    const params = { hours: 3, hourlyRate: 1000, freeHours: 2, taxRate: 19, courtesyApplies: true };
    // Act
    const result = calculateCharge(params);
    // Assert
    expect(result.chargedHours).toBe(1);
    expect(result.base).toBe(1000);
  });

  it('calculates tax correctly on the base', () => {
    // Arrange — 3h with 2 free, rate=2000 → base=2000, iva=Math.round(2000*19/119)
    const params = { hours: 3, hourlyRate: 2000, freeHours: 2, taxRate: 19, courtesyApplies: true };
    // Act
    const result = calculateCharge(params);
    // Assert
    expect(result.chargedHours).toBe(1);
    expect(result.base).toBe(2000);
    expect(result.iva).toBe(Math.round(2000 * 19 / 119));
    expect(result.total).toBe(2000);
  });

  it('returns freeHours=0 when courtesyApplies=false', () => {
    // Arrange
    const params = { hours: 3, hourlyRate: 1000, freeHours: 2, taxRate: 19, courtesyApplies: false };
    // Act
    const result = calculateCharge(params);
    // Assert
    expect(result.freeHours).toBe(0);
  });

  it('returns correct freeHours when courtesyApplies=true', () => {
    // Arrange
    const params = { hours: 3, hourlyRate: 1000, freeHours: 2, taxRate: 19, courtesyApplies: true };
    // Act
    const result = calculateCharge(params);
    // Assert
    expect(result.freeHours).toBe(2);
  });

  it('handles 0 hours without error', () => {
    // Arrange
    const params = { hours: 0, hourlyRate: 1000, freeHours: 2, taxRate: 19, courtesyApplies: true };
    // Act
    const result = calculateCharge(params);
    // Assert
    expect(result.chargedHours).toBe(0);
    expect(result.base).toBe(0);
    expect(result.total).toBe(0);
  });

  it('handles negative hours as 0 charged', () => {
    // Arrange
    const params = { hours: -1, hourlyRate: 1000, freeHours: 2, taxRate: 19, courtesyApplies: true };
    // Act
    const result = calculateCharge(params);
    // Assert
    expect(result.chargedHours).toBe(0);
    expect(result.base).toBe(0);
    expect(result.total).toBe(0);
  });
});
