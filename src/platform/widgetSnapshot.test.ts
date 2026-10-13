import { describe, expect, it } from '@jest/globals';

import { applyTransaction, setUp, type BudgetSettings } from '@/domain/budget';
import { widgetSnapshot } from './widgetSnapshot';

const settings: BudgetSettings = {
  mainIncome: { amount: 100_000, day: 25 },
  otherIncomes: [],
  fixedCharges: [],
  monthlySavings: 0,
};

/** 300.00 from Oct 10, pay day 25 -> 15 days -> 20.00/day. */
const start = () => setUp(30_000, true, '2025-10-10', settings);

describe('widgetSnapshot', () => {
  it('is null before setup', () => {
    expect(widgetSnapshot(null, null, '2025-10-10')).toBeNull();
  });

  it('shows the saved numbers on the same day', () => {
    const budget = applyTransaction(start(), {
      id: '1',
      title: 'Coffee',
      amount: -450,
      date: '2025-10-10',
    });
    expect(widgetSnapshot(settings, budget, '2025-10-10')).toEqual({
      todayLeft: 1_550,
      balance: 0,
    });
  });

  it('closes the days elapsed since the app was last opened', () => {
    const budget = applyTransaction(start(), {
      id: '1',
      title: 'Coffee',
      amount: -450,
      date: '2025-10-10',
    });
    // Oct 10 left 15.50 and Oct 11 left 20.00 go to the reserve; Oct 12 starts fresh
    expect(widgetSnapshot(settings, budget, '2025-10-12')).toEqual({
      todayLeft: 2_000,
      balance: 3_550,
    });
  });
});
