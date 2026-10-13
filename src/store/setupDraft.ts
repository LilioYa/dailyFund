import { create } from 'zustand';

import type { FixedCharge, RecurringIncome } from '@/domain/budget';

/** What the user typed during first setup, shared by both steps. Not saved: lost if the app is killed. */
interface SetupDraft {
  mainIncome: string;
  payDay: number;
  savings: string;
  otherIncomes: RecurringIncome[];
  fixedCharges: FixedCharge[];
  currentMoney: string;
  chargesAlreadyPaid: boolean;
  update(changes: Partial<Omit<SetupDraft, 'update' | 'reset'>>): void;
  reset(): void;
}

const empty = {
  mainIncome: '',
  payDay: 25,
  savings: '',
  otherIncomes: [],
  fixedCharges: [],
  currentMoney: '',
  chargesAlreadyPaid: false,
};

export const useSetupDraft = create<SetupDraft>()((set) => ({
  ...empty,
  update: (changes) => set(changes),
  reset: () => set(empty),
}));
