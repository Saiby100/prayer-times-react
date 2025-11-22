import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import schedulePrayerReminder from './schedulePrayerReminder';
import { PrayerReminder } from '@/types/notifications';

const PRAYER_NOTIFICATION_TASK = 'PRAYER-NOTIFICATION-TASK';

if (!TaskManager.isTaskDefined(PRAYER_NOTIFICATION_TASK)) {
  TaskManager.defineTask(PRAYER_NOTIFICATION_TASK, async ({ data, executionInfo }) => {
    if (executionInfo.taskName !== PRAYER_NOTIFICATION_TASK) return;
    await schedulePrayerReminder(data as PrayerReminder);
  });
}
Notifications.registerTaskAsync(PRAYER_NOTIFICATION_TASK);

// async function registerReminderNotificationTask() {
//   return await Notifications.registerTaskAsync(PRAYER_NOTIFICATION_TASK);
// }

// async function unregisterReminderNotificationTask() {
//   return await Notifications.unregisterTaskAsync(PRAYER_NOTIFICATION_TASK);
// }

// export { registerReminderNotificationTask, unregisterReminderNotificationTask };
