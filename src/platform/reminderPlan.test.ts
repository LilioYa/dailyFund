import { describe, expect, it } from '@jest/globals';

import { setUp, type BudgetSettings } from '@/domain/budget';
import { planReminders, REMINDER_DAYS } from './reminderPlan';

const settings: BudgetSettings = {
  mainIncome: { amount: 100_000, day: 25 },
  otherIncomes: [],
  fixedCharges: [],
  monthlySavings: 20_000,
};

describe('planReminders', () => {
  it('plans one reminder per day, today included if the time has not passed', () => {
    const budget = setUp(30_000, true, '2025-10-10', settings);
    const plan = planReminders(budget, settings, new Date(2025, 9, 10, 18, 0), 20, 0);
    expect(plan).toHaveLength(REMINDER_DAYS);
    expect(plan[0].at).toEqual(new Date(2025, 9, 10, 20, 0));
    expect(plan[0].left).toBe(2_000);
  });

  it('skips today once the time has passed', () => {
    const budget = setUp(30_000, true, '2025-10-10', settings);
    const plan = planReminders(budget, settings, new Date(2025, 9, 10, 21, 0), 20, 0);
    expect(plan).toHaveLength(REMINDER_DAYS - 1);
    expect(plan[0].at).toEqual(new Date(2025, 9, 11, 20, 0));
  });

  it('uses the amounts the budget rules give for days ahead, pay day included', () => {
    const budget = setUp(4_000, true, '2025-10-23', settings); // 2 days -> 20.00/day
    const plan = planReminders(budget, settings, new Date(2025, 9, 23, 8, 0), 20, 0);
    expect(plan[0].left).toBe(2_000);
    expect(plan[1].left).toBe(2_000);
    // Oct 25 is pay day: 80 000 for 31 days
    expect(plan[2].left).toBe(80_000 - Math.floor(80_000 / 31) * 30);
  });
});
