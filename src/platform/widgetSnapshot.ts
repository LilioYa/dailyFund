import { advanceTo, type BudgetSettings, type BudgetState } from '@/domain/budget';
import type { IsoDate } from '@/domain/calendar';
import type { Cents } from '@/domain/money';

/** What the home screen widget shows. */
export interface WidgetSnapshot {
  todayLeft: Cents;
  balance: Cents;
}

/**
 * The widget's numbers for `today`. The saved budget may be from a previous day when the app
 * wasn't opened since, so the elapsed days are closed here too (without saving). Null before setup.
 */
export function widgetSnapshot(
  settings: BudgetSettings | null,
  budget: BudgetState | null,
  today: IsoDate,
): WidgetSnapshot | null {
  if (!settings || !budget) return null;
  const current = advanceTo(budget, today, settings);
  return { todayLeft: current.todayLeft, balance: current.balance };
}
