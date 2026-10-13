import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BudgetSettings } from '@/domain/budget';
import { STORAGE_KEY, useAppStore } from './appStore';

const settings: BudgetSettings = {
  mainIncome: { amount: 100_000, day: 25 },
  otherIncomes: [],
  fixedCharges: [],
  monthlySavings: 0,
};

const store = () => useAppStore.getState();
const setToday = (date: string) => jest.setSystemTime(new Date(`${date}T12:00:00`));

beforeEach(async () => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  setToday('2025-10-10');
  store().resetAll();
  await AsyncStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('appStore', () => {
  it('refuses transactions before setup', () => {
    expect(store().addTransaction({ title: 'x', amount: -500, date: '2025-10-10' })).toEqual({
      ok: false,
      error: 'not-set-up',
    });
  });

  it('sets up the budget for today', () => {
    store().completeSetup(settings, 30_000, true);
    expect(store().budget?.currentDay).toBe('2025-10-10');
    expect(store().budget?.perDay).toBe(2_000);
  });

  it('adds a transaction and validates input', () => {
    store().completeSetup(settings, 30_000, true);
    expect(store().addTransaction({ title: 'x', amount: 0, date: '2025-10-10' })).toEqual({
      ok: false,
      error: 'zero-amount',
    });
    expect(store().addTransaction({ title: 'x', amount: -500, date: '2025-10-11' })).toEqual({
      ok: false,
      error: 'future-date',
    });
    expect(store().addTransaction({ title: 'Lunch', amount: -500, date: '2025-10-10' })).toEqual({
      ok: true,
    });
    expect(store().budget?.todayLeft).toBe(1_500);
    expect(store().transactions.map((t) => t.title)).toEqual(['Lunch']);
  });

  it('keeps transactions newest first', () => {
    store().completeSetup(settings, 30_000, true);
    setToday('2025-10-12');
    store().addTransaction({ title: 'old', amount: -100, date: '2025-10-10' });
    store().addTransaction({ title: 'new', amount: -100, date: '2025-10-12' });
    store().addTransaction({ title: 'mid', amount: -100, date: '2025-10-11' });
    expect(store().transactions.map((t) => t.title)).toEqual(['new', 'mid', 'old']);
  });

  it('updates a transaction', () => {
    store().completeSetup(settings, 30_000, true);
    store().addTransaction({ title: 'Lunch', amount: -500, date: '2025-10-10' });
    const id = store().transactions[0].id;
    store().updateTransaction(id, { title: 'Dinner', amount: -800, date: '2025-10-10' });
    expect(store().budget?.todayLeft).toBe(1_200);
    expect(store().transactions[0]).toMatchObject({ id, title: 'Dinner', amount: -800 });
  });

  it('deletes and restores a transaction (undo)', () => {
    store().completeSetup(settings, 30_000, true);
    store().addTransaction({ title: 'Lunch', amount: -500, date: '2025-10-10' });
    const before = store().budget;
    const deleted = store().deleteTransaction(store().transactions[0].id);
    expect(store().budget?.todayLeft).toBe(2_000);
    expect(store().transactions).toEqual([]);
    store().restoreTransaction(deleted!);
    expect(store().budget).toEqual(before);
  });

  it('closes elapsed days when advancing to today', () => {
    store().completeSetup(settings, 30_000, true);
    setToday('2025-10-12');
    store().advanceToToday();
    expect(store().budget?.currentDay).toBe('2025-10-12');
    expect(store().budget?.history).toHaveLength(2);
    expect(store().budget?.balance).toBe(4_000);
  });

  it('spreads the balance', () => {
    store().completeSetup(settings, 30_000, true);
    setToday('2025-10-12');
    store().spread();
    expect(store().budget?.balance).toBe(0);
    expect(store().budget?.perDay).toBe(Math.floor(30_000 / 13));
  });

  it('persists data with a schema version', async () => {
    store().completeSetup(settings, 30_000, true);
    store().setPreferences({ currency: 'EUR' });
    await jest.runAllTimersAsync();
    const saved = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? '{}');
    expect(saved.version).toBe(1);
    expect(saved.state.preferences.currency).toBe('EUR');
    expect(saved.state.budget.perDay).toBe(2_000);
    expect(saved.state.addTransaction).toBeUndefined();
  });
});
