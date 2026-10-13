import { addDays, daysUntilPayday, isDayOfMonth, type IsoDate } from './calendar';
import type { Cents } from './money';

export interface RecurringIncome {
  id: string;
  name: string;
  amount: Cents;
  /** Day of month, clamped to the month's last day. */
  day: number;
}

export interface FixedCharge {
  id: string;
  name: string;
  amount: Cents;
}

export interface BudgetSettings {
  /** The main income defines the budget period: from one main pay day to the next. */
  mainIncome: { amount: Cents; day: number };
  otherIncomes: RecurringIncome[];
  /** Reserved all at once at the start of each period. */
  fixedCharges: FixedCharge[];
  monthlySavings: Cents;
}

/** Budget vs spending of one closed day. */
export interface DayRecord {
  date: IsoDate;
  budget: Cents;
  spent: Cents;
}

/**
 * Invariant (see `assertInvariant`):
 * fund = todayLeft + perDay * (daysUntilPayday - 1) + balance.
 */
export interface BudgetState {
  /** Money left until the next main pay day, including today's money and the balance. */
  fund: Cents;
  /** Daily budget of the coming days. */
  perDay: Cents;
  /** Budget of the current day: perDay, plus the division remainder on days the budget was recalculated. */
  todayBudget: Cents;
  /** What is left to spend today. */
  todayLeft: Cents;
  /** Leftovers (or overspending) of past days, plus incomes not spread yet. */
  balance: Cents;
  /** The day `todayBudget` / `todayLeft` belong to. */
  currentDay: IsoDate;
  history: DayRecord[];
}

/** Signed amount: negative = expense, positive = income. */
export interface Transaction {
  id: string;
  title: string;
  amount: Cents;
  date: IsoDate;
}

export function totalFixedCharges(settings: BudgetSettings): Cents {
  return settings.fixedCharges.reduce((sum, charge) => sum + charge.amount, 0);
}

export function dayRecordDiff(record: DayRecord): Cents {
  return record.budget - record.spent;
}

/**
 * Starts budgeting on `today` with the money the user currently has.
 * If this period's fixed charges are not paid yet, they are reserved now.
 */
export function setUp(
  currentMoney: Cents,
  chargesAlreadyPaid: boolean,
  today: IsoDate,
  settings: BudgetSettings,
): BudgetState {
  const fund = chargesAlreadyPaid ? currentMoney : currentMoney - totalFixedCharges(settings);
  const empty: BudgetState = {
    fund,
    perDay: 0,
    todayBudget: 0,
    todayLeft: 0,
    balance: 0,
    currentDay: today,
    history: [],
  };
  return recalculate(empty, settings.mainIncome.day);
}

/** Recomputes the daily budget from the fund, keeping the balance and what was spent today. */
export function recalculate(state: BudgetState, payDay: number): BudgetState {
  const spentToday = state.todayBudget - state.todayLeft;
  const toSpread = state.fund - state.balance + spentToday;
  const days = daysUntilPayday(state.currentDay, payDay);
  const perDay = Math.floor(toSpread / days);
  const todayBudget = perDay + (toSpread - perDay * days);
  return { ...state, perDay, todayBudget, todayLeft: todayBudget - spentToday };
}

/** Moves the whole balance into the daily budget of the remaining days. */
export function spread(state: BudgetState, payDay: number): BudgetState {
  return recalculate({ ...state, balance: 0 }, payDay);
}

/**
 * Closes every day from `currentDay` up to (excluding) `today`, including days the app was not
 * opened: the leftover goes to the balance and a DayRecord is stored. On the main pay day the
 * period's money is added and the budget recalculated; other incomes go to the fund and the balance.
 */
export function advanceTo(
  state: BudgetState,
  today: IsoDate,
  settings: BudgetSettings,
): BudgetState {
  let s = state;
  while (s.currentDay < today) {
    const record: DayRecord = {
      date: s.currentDay,
      budget: s.todayBudget,
      spent: s.todayBudget - s.todayLeft,
    };
    const day = addDays(s.currentDay, 1);
    s = {
      ...s,
      balance: s.balance + s.todayLeft,
      todayBudget: s.perDay,
      todayLeft: s.perDay,
      currentDay: day,
      history: [...s.history, record],
    };

    const isMainPayday = isDayOfMonth(day, settings.mainIncome.day);
    if (isMainPayday) {
      const periodMoney =
        settings.mainIncome.amount - settings.monthlySavings - totalFixedCharges(settings);
      s = { ...s, fund: s.fund + periodMoney };
    }
    for (const income of settings.otherIncomes) {
      if (isDayOfMonth(day, income.day)) {
        s = { ...s, fund: s.fund + income.amount, balance: s.balance + income.amount };
      }
    }
    if (isMainPayday) {
      s = recalculate(s, settings.mainIncome.day);
    }
  }
  return s;
}

export function applyTransaction(state: BudgetState, tx: Transaction): BudgetState {
  return applySigned(state, tx, 1);
}

export function revertTransaction(state: BudgetState, tx: Transaction): BudgetState {
  return applySigned(state, tx, -1);
}

/**
 * Income goes to the fund and the balance, never to today's money.
 * An expense today reduces today's money; an expense on a closed day reduces the balance and that
 * day's record.
 */
function applySigned(state: BudgetState, tx: Transaction, factor: 1 | -1): BudgetState {
  if (tx.date > state.currentDay) {
    throw new Error(`Transaction date ${tx.date} is after the current day ${state.currentDay}`);
  }
  const amount = tx.amount * factor;
  const fund = state.fund + amount;
  if (tx.amount >= 0) {
    return { ...state, fund, balance: state.balance + amount };
  }
  if (tx.date === state.currentDay) {
    return { ...state, fund, todayLeft: state.todayLeft + amount };
  }
  const history = state.history.map((record) =>
    record.date === tx.date ? { ...record, spent: record.spent - amount } : record,
  );
  return { ...state, fund, balance: state.balance + amount, history };
}

/** Throws if the budget invariant doesn't hold. Used by tests and as a safety check. */
export function assertInvariant(state: BudgetState, payDay: number): void {
  const days = daysUntilPayday(state.currentDay, payDay);
  const expected = state.todayLeft + state.perDay * (days - 1) + state.balance;
  if (expected !== state.fund) {
    throw new Error(`Budget invariant broken: fund ${state.fund} != ${expected}`);
  }
}
