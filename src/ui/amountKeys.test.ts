import { describe, expect, it } from '@jest/globals';

import { applyKey, type Key } from './amountKeys';

const type = (keys: Key[]) => keys.reduce((text, key) => applyKey(text, key), '');

describe('applyKey', () => {
  it('types an amount with decimals', () => {
    expect(type(['1', '2', ',', '5', '0'])).toBe('12,50');
  });

  it('starts with 0 when the comma comes first and accepts one comma only', () => {
    expect(type([',', '5', ','])).toBe('0,5');
  });

  it('limits to 2 decimals and 7 digits before the comma', () => {
    expect(type(['1', ',', '2', '3', '4'])).toBe('1,23');
    expect(type(['9', '9', '9', '9', '9', '9', '9', '9'])).toBe('9999999');
  });

  it('replaces a leading zero and erases', () => {
    expect(type(['0', '5'])).toBe('5');
    expect(type(['4', '2', 'back'])).toBe('4');
    expect(type(['back'])).toBe('');
  });
});
