import type { PlannedReminder } from './reminderPlan';

// A web app cannot schedule local notifications; reminders on iPhone would need web push.

export const remindersSupported = false;

export async function requestReminderPermission(): Promise<boolean> {
  return false;
}

export async function scheduleReminders(
  _reminders: PlannedReminder[],
  _content: (reminder: PlannedReminder) => { title: string; body: string },
  _channelName: string,
): Promise<void> {}
