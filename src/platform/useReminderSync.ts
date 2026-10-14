import { useEffect } from 'react';

import { useFormatMoney, useTranslation } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { planReminders } from './reminderPlan';
import { remindersSupported, scheduleReminders } from './reminders';

/** Reschedules the daily reminders whenever the budget, settings or preferences change. */
export function useReminderSync(hydrated: boolean): void {
  const budget = useAppStore((s) => s.budget);
  const settings = useAppStore((s) => s.settings);
  const reminder = useAppStore((s) => s.preferences.reminder);
  const formatMoney = useFormatMoney();
  const { t } = useTranslation();

  useEffect(() => {
    // Before loading, the empty initial state would cancel the saved reminders
    if (!remindersSupported || !hydrated) return;
    const planned =
      reminder.enabled && budget && settings
        ? planReminders(budget, settings, new Date(), reminder.hour, reminder.minute)
        : [];
    scheduleReminders(
      planned,
      ({ left }) => ({
        title: t('reminder.title'),
        body: t('reminder.body', { left: formatMoney(left) }),
      }),
      t('reminder.channel'),
    ).catch((error: unknown) => console.error('Failed to schedule reminders', error));
  }, [hydrated, budget, settings, reminder, formatMoney, t]);
}
