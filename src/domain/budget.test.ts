import { describe, expect, it } from '@jest/globals';
import {
  advanceTo,
  applyTransaction,
  assertInvariant,
  revertTransaction,
  setUp,
  spread,
  recalculate,
  type BudgetSettings,
  type BudgetState,
  type Transaction,
} from './budget';

const PAY_DAY = 25;
const settings: BudgetSettings = {
  mainIncome: { amount: 100_000, day: PAY_DAY },
  otherIncomes: [],
  fixedCharges: [],
  monthlySavings: 20_000,
};
const OCT_10 = '2025-10-10';

let nextId = 0;
const expense = (amount: number, date: string): Transaction => ({
  id: String(nextId++),
  title: 'x',
  amount: -amount,
  date,
});
const income = (amount: number, date: string): Transaction => ({
  id: String(nextId++),
  title: 'x',
  amount,
  date,
});

/** 300.00 from Oct 10, pay day 25 -> 15 days -> 20.00/day. */
const start = (): BudgetState => setUp(30_000, true, OCT_10, settings);

describe('setUp', () => {
  it('splits the money over the days until pay day', () => {
    const s = start();
    expect(s.perDay).toBe(2_000);
    expect(s.todayLeft).toBe(2_000);
    expect(s.balance).toBe(0);
    assertInvariant(s, PAY_DAY);
  });

  it('reserves fixed charges not paid yet', () => {
    const withCharges = {
      ...settings,
      fixedCharges: [{ id: 'rent', name: 'Rent', amount: 15_000 }],
    };
    const s = setUp(45_000, false, OCT_10, withCharges);
    expect(s.fund).toBe(30_000);
    expect(s.perDay).toBe(2_000);
  });

  it('gives the division remainder to the current day', () => {
    const s = setUp(10_000, true, OCT_10, settings); // 100.00 over 15 days
    expect(s.perDay).toBe(666);
    expect(s.todayBudget).toBe(676);
    assertInvariant(s, PAY_DAY);
  });
});

describe('transactions', () => {
  it('reduces today’s money for an expense today', () => {
    const s = applyTransaction(start(), expense(500, OCT_10));
    expect(s.todayLeft).toBe(1_500);
    expect(s.fund).toBe(29_500);
    expect(s.balance).toBe(0);
    assertInvariant(s, PAY_DAY);
  });

  it('adds income to the fund and the balance, not to today', () => {
    const s = applyTransaction(start(), income(5_000, OCT_10));
    expect(s.todayLeft).toBe(2_000);
    expect(s.fund).toBe(35_000);
    expect(s.balance).toBe(5_000);
    assertInvariant(s, PAY_DAY);
  });

  it('charges an expense on a closed day to the balance and that day’s record', () => {
    const advanced = advanceTo(start(), '2025-10-11', settings);
    const s = applyTransaction(advanced, expense(800, OCT_10));
    expect(s.balance).toBe(1_200);
    expect(s.todayLeft).toBe(2_000);
    expect(s.history).toEqual([{ date: OCT_10, budget: 2_000, spent: 800 }]);
    assertInvariant(s, PAY_DAY);
  });

  it('rejects a transaction after the current day', () => {
    expect(() => applyTransaction(start(), expense(100, '2025-10-11'))).toThrow();
  });

  it('revert undoes apply', () => {
    const base = advanceTo(start(), '2025-10-11', settings);
    for (const tx of [expense(800, OCT_10), expense(300, '2025-10-11'), income(5_000, OCT_10)]) {
      expect(revertTransaction(applyTransaction(base, tx), tx)).toEqual(base);
    }
  });

  it('edits as revert old then apply new', () => {
    const old = expense(500, OCT_10);
    const edited = { ...old, amount: -700 };
    const result = applyTransaction(revertTransaction(applyTransaction(start(), old), old), edited);
    expect(result).toEqual(applyTransaction(start(), edited));
  });
});

describe('advanceTo', () => {
  it('closes every elapsed day, including days the app was not opened', () => {
    const s = advanceTo(applyTransaction(start(), expense(500, OCT_10)), '2025-10-12', settings);
    expect(s.currentDay).toBe('2025-10-12');
    expect(s.balance).toBe(3_500); // 15.00 left on Oct 10 + 20.00 on Oct 11
    expect(s.todayLeft).toBe(2_000);
    expect(s.history).toEqual([
      { date: OCT_10, budget: 2_000, spent: 500 },
      { date: '2025-10-11', budget: 2_000, spent: 0 },
    ]);
    assertInvariant(s, PAY_DAY);
  });

  it('does nothing on the same day', () => {
    expect(advanceTo(start(), OCT_10, settings)).toEqual(start());
  });

  it('adds main income minus savings and charges on pay day, keeping the balance', () => {
    const withCharges = {
      ...settings,
      fixedCharges: [
        { id: 'rent', name: 'Rent', amount: 40_000 },
        { id: 'phone', name: 'Phone', amount: 2_000 },
      ],
    };
    const s = advanceTo(setUp(4_000, true, '2025-10-23', withCharges), '2025-10-25', withCharges);
    // 100 000 - 20 000 savings - 42 000 charges = 38 000 for Oct 25 -> Nov 25 (31 days)
    expect(s.balance).toBe(4_000);
    expect(s.fund).toBe(42_000);
    expect(s.perDay).toBe(Math.floor(38_000 / 31));
    assertInvariant(s, PAY_DAY);
  });

  it('adds other incomes to the fund and the balance on their day', () => {
    const withSideJob = {
      ...settings,
      otherIncomes: [{ id: 'side', name: 'Side job', amount: 30_000, day: 12 }],
    };
    const s = advanceTo(start(), '2025-10-12', withSideJob);
    expect(s.balance).toBe(4_000 + 30_000);
    expect(s.fund).toBe(60_000);
    expect(s.perDay).toBe(2_000);
    assertInvariant(s, PAY_DAY);
  });

  it('clamps pay day 31 to the last day of shorter months', () => {
    const endOfMonth = { ...settings, mainIncome: { amount: 100_000, day: 31 } };
    const s = advanceTo(setUp(1_000, true, '2025-04-29', endOfMonth), '2025-04-30', endOfMonth);
    expect(s.fund).toBe(1_000 + 80_000);
    expect(s.perDay).toBe(Math.floor(80_000 / 31)); // Apr 30 -> May 31
    assertInvariant(s, 31);
  });
});

describe('spread and recalculate', () => {
  it('spread moves the balance into the daily budget', () => {
    const advanced = applyTransaction(
      advanceTo(applyTransaction(start(), expense(500, OCT_10)), '2025-10-12', settings),
      expense(400, '2025-10-12'),
    );
    const s = spread(advanced, PAY_DAY);
    // fund 291.00 + 4.00 spent today over 13 days
    expect(s.balance).toBe(0);
    expect(s.perDay).toBe(Math.floor(29_500 / 13));
    expect(s.todayLeft).toBe(s.todayBudget - 400);
    assertInvariant(s, PAY_DAY);
  });

  it('recalculate keeps the balance and today’s spending', () => {
    const s = recalculate(
      { ...applyTransaction(start(), expense(500, OCT_10)), fund: 44_500 },
      PAY_DAY,
    );
    expect(s.perDay).toBe(3_000); // (445.00 + 5.00) / 15
    expect(s.todayLeft).toBe(2_500);
    assertInvariant(s, PAY_DAY);
  });

  it('recalculate on an unchanged state is the identity', () => {
    const s = applyTransaction(start(), expense(500, OCT_10));
    expect(recalculate(s, PAY_DAY)).toEqual(s);
  });
});
