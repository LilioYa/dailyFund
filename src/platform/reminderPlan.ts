import { advanceTo, type BudgetSettings, type BudgetState } from '@/domain/budget';
import { addDays, localToday } from '@/domain/calendar';
import type { Cents } from '@/domain/money';

export interface PlannedReminder {
  at: Date;
  /** Money left that day, assuming nothing else is logged before the reminder. */
  left: Cents;
}

/** Days ahead to schedule; rescheduled every time the data changes or the app opens. */
export const REMINDER_DAYS = 7;

/**
 * The next reminders, one per day at hour:minute, skipping a time already passed today.
 * Amounts come from the budget rules, so pay days and incomes ahead are taken into account.
 */
export function planReminders(
  budget: BudgetState,
  settings: BudgetSettings,
  now: Date,
  hour: number,
  minute: number,
): PlannedReminder[] {
  const today = localToday(now);
  const reminders: PlannedReminder[] = [];
  for (let offset = 0; offset < REMINDER_DAYS; offset++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, minute);
    if (at <= now) continue;
    const day = addDays(today, offset);
    const state = day > budget.currentDay ? advanceTo(budget, day, settings) : budget;
    reminders.push({ at, left: state.todayLeft });
  }
  return reminders;
}
