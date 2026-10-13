import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  advanceTo,
  applyTransaction,
  recalculate,
  revertTransaction,
  setUp,
  spread,
  type BudgetSettings,
  type BudgetState,
  type Transaction,
} from '@/domain/budget';
import { localToday, type IsoDate } from '@/domain/calendar';
import type { Cents } from '@/domain/money';

export type Language = 'fr' | 'en';

export interface Preferences {
  /** ISO 4217 code, e.g. "CHF". */
  currency: string;
  /** null = follow the device language. */
  language: Language | null;
  reminder: { enabled: boolean; hour: number; minute: number };
}

export interface AppData {
  /** null until the first setup is done. */
  settings: BudgetSettings | null;
  budget: BudgetState | null;
  /** Newest first. */
  transactions: Transaction[];
  preferences: Preferences;
}

export type TransactionInput = Omit<Transaction, 'id'>;

export type TransactionError = 'not-set-up' | 'zero-amount' | 'future-date';
export type TransactionResult = { ok: true } | { ok: false; error: TransactionError };

interface Actions {
  completeSetup(settings: BudgetSettings, currentMoney: Cents, chargesAlreadyPaid: boolean): void;
  /** Closes the days elapsed since the last call. Called on app start and when it comes back. */
  advanceToToday(): void;
  addTransaction(input: TransactionInput): TransactionResult;
  updateTransaction(id: string, input: TransactionInput): TransactionResult;
  /** Returns the deleted transaction so it can be restored (undo). */
  deleteTransaction(id: string): Transaction | undefined;
  restoreTransaction(tx: Transaction): TransactionResult;
  spread(): void;
  /** Charges and incomes apply from the next pay day; a new pay day recalculates now. */
  updateSettings(settings: BudgetSettings): void;
  /** Corrects the money left until pay day (e.g. to match the bank account). */
  setFund(fund: Cents): void;
  setPreferences(preferences: Partial<Preferences>): void;
  resetAll(): void;
}

export type AppStore = AppData & Actions;

export const STORAGE_KEY = 'dailyfund';
const SCHEMA_VERSION = 1;

const initialData: AppData = {
  settings: null,
  budget: null,
  transactions: [],
  preferences: {
    currency: 'CHF',
    language: null,
    reminder: { enabled: false, hour: 20, minute: 0 },
  },
};

let idCounter = 0;
function newId(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}-${idCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sortNewestFirst(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
}

function validate(input: TransactionInput, today: IsoDate): TransactionError | null {
  if (input.amount === 0) return 'zero-amount';
  if (input.date > today) return 'future-date';
  return null;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => {
      /** Brings the budget to today; returns the up-to-date state. */
      const advanced = (): AppData => {
        const { settings, budget } = get();
        if (settings && budget) {
          const today = localToday();
          if (budget.currentDay < today) {
            set({ budget: advanceTo(budget, today, settings) });
          }
        }
        return get();
      };

      return {
        ...initialData,

        completeSetup(settings, currentMoney, chargesAlreadyPaid) {
          set({
            settings,
            budget: setUp(currentMoney, chargesAlreadyPaid, localToday(), settings),
            transactions: [],
          });
        },

        advanceToToday() {
          advanced();
        },

        addTransaction(input) {
          const { budget, transactions } = advanced();
          if (!budget) return { ok: false, error: 'not-set-up' };
          const error = validate(input, localToday());
          if (error) return { ok: false, error };
          const tx: Transaction = { ...input, id: newId() };
          set({
            budget: applyTransaction(budget, tx),
            transactions: sortNewestFirst([tx, ...transactions]),
          });
          return { ok: true };
        },

        updateTransaction(id, input) {
          const { budget, transactions } = advanced();
          if (!budget) return { ok: false, error: 'not-set-up' };
          const old = transactions.find((tx) => tx.id === id);
          if (!old) throw new Error(`Unknown transaction ${id}`);
          const error = validate(input, localToday());
          if (error) return { ok: false, error };
          const updated: Transaction = { ...input, id };
          set({
            budget: applyTransaction(revertTransaction(budget, old), updated),
            transactions: sortNewestFirst(transactions.map((tx) => (tx.id === id ? updated : tx))),
          });
          return { ok: true };
        },

        deleteTransaction(id) {
          const { budget, transactions } = advanced();
          const tx = transactions.find((t) => t.id === id);
          if (!budget || !tx) return undefined;
          set({
            budget: revertTransaction(budget, tx),
            transactions: transactions.filter((t) => t.id !== id),
          });
          return tx;
        },

        restoreTransaction(tx) {
          const { budget, transactions } = advanced();
          if (!budget) return { ok: false, error: 'not-set-up' };
          set({
            budget: applyTransaction(budget, tx),
            transactions: sortNewestFirst([tx, ...transactions]),
          });
          return { ok: true };
        },

        spread() {
          const { budget, settings } = advanced();
          if (!budget || !settings) return;
          set({ budget: spread(budget, settings.mainIncome.day) });
        },

        updateSettings(settings) {
          const { budget } = advanced();
          set({
            settings,
            budget: budget ? recalculate(budget, settings.mainIncome.day) : null,
          });
        },

        setFund(fund) {
          const { budget, settings } = advanced();
          if (!budget || !settings) return;
          set({ budget: recalculate({ ...budget, fund }, settings.mainIncome.day) });
        },

        setPreferences(preferences) {
          set({ preferences: { ...get().preferences, ...preferences } });
        },

        resetAll() {
          set(initialData);
        },
      };
    },
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ settings, budget, transactions, preferences }): AppData => ({
        settings,
        budget,
        transactions,
        preferences,
      }),
    },
  ),
);
