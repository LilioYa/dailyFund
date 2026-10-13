import { describe, expect, it } from '@jest/globals';
import { centsToInput, formatMoney, parseAmount } from './money';

describe('money', () => {
  it('parses amounts typed by the user', () => {
    expect(parseAmount('12')).toBe(1_200);
    expect(parseAmount('12.5')).toBe(1_250);
    expect(parseAmount('12,50')).toBe(1_250);
    expect(parseAmount(' -12.05 ')).toBe(-1_205);
    expect(parseAmount('+50')).toBe(5_000);
  });

  it('rejects invalid amounts', () => {
    for (const text of ['', 'abc', '12.345', '1.2.3', '-', '12.']) {
      expect(parseAmount(text)).toBeNull();
    }
  });

  it('formats with the currency and locale', () => {
    expect(formatMoney(-1_250, 'EUR', 'en-US')).toBe('-€12.50');
    expect(formatMoney(123_456, 'USD', 'en-US')).toBe('$1,234.56');
  });

  it('converts cents back to an editable string', () => {
    expect(centsToInput(-1_205)).toBe('-12.05');
    expect(centsToInput(5_000)).toBe('50.00');
  });
});
