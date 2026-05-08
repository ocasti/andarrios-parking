import { describe, it, expect } from 'vitest';
import { evaluateCourtesy, calculateSince } from '../CortesiaService';

describe('evaluateCourtesy', () => {
  it('applies courtesy when there is no recent exit history', () => {
    // Arrange
    const history: { checkedOutAt: string }[] = [];
    // Act
    const result = evaluateCourtesy(history, 6);
    // Assert
    expect(result).toBe(true);
  });

  it('does not apply courtesy when there is a recent exit', () => {
    // Arrange
    const history = [{ checkedOutAt: new Date().toISOString() }];
    // Act
    const result = evaluateCourtesy(history, 6);
    // Assert
    expect(result).toBe(false);
  });

  it('does not apply courtesy when there are multiple recent exits', () => {
    // Arrange
    const now = new Date().toISOString();
    const history = [
      { checkedOutAt: now },
      { checkedOutAt: now },
    ];
    // Act
    const result = evaluateCourtesy(history, 6);
    // Assert
    expect(result).toBe(false);
  });

  it('always applies courtesy when minHoursForCourtesy is 0', () => {
    // Arrange — even with recent history, with 0h courtesy always applies
    const history = [{ checkedOutAt: new Date().toISOString() }];
    // Act
    const result = evaluateCourtesy(history, 0);
    // Assert
    expect(result).toBe(true);
  });

  it('always applies courtesy when minHoursForCourtesy is negative', () => {
    // Arrange
    const history = [{ checkedOutAt: new Date().toISOString() }];
    // Act
    const result = evaluateCourtesy(history, -3);
    // Assert
    expect(result).toBe(true);
  });
});

describe('calculateSince', () => {
  it('returns correct date subtracting the indicated hours', () => {
    // Arrange
    const now = new Date('2026-05-08T12:00:00Z');
    const hours = 3;
    // Act
    const result = calculateSince(hours, now);
    // Assert
    const expected = new Date('2026-05-08T09:00:00Z');
    expect(result.getTime()).toBe(expected.getTime());
  });

  it('returns date 6 hours back for hours=6', () => {
    // Arrange
    const now = new Date('2026-05-08T18:00:00Z');
    // Act
    const result = calculateSince(6, now);
    // Assert
    const expected = new Date('2026-05-08T12:00:00Z');
    expect(result.getTime()).toBe(expected.getTime());
  });
});
