import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { PlannedReminder } from './reminderPlan';

const CHANNEL_ID = 'daily-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const remindersSupported = true;

/** Asks for the notification permission (Android 13+). Returns whether it is granted. */
export async function requestReminderPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// Calls are chained so a cancel/schedule pass never interleaves with another one
let queue: Promise<void> = Promise.resolve();

/** Replaces all scheduled reminders with the given ones. An empty list just cancels them. */
export function scheduleReminders(
  reminders: PlannedReminder[],
  content: (reminder: PlannedReminder) => { title: string; body: string },
  channelName: string,
): Promise<void> {
  const run = queue.then(() => replaceReminders(reminders, content, channelName));
  // Keep the chain alive after a failure; the caller still gets the error
  queue = run.catch(() => undefined);
  return run;
}

async function replaceReminders(
  reminders: PlannedReminder[],
  content: (reminder: PlannedReminder) => { title: string; body: string },
  channelName: string,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (reminders.length === 0) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: channelName,
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  for (const reminder of reminders) {
    await Notifications.scheduleNotificationAsync({
      content: content(reminder),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.at,
        channelId: CHANNEL_ID,
      },
    });
  }
}
