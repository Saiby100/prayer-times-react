import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';

export const NAME = 'PRAYER_REMINDER_BACKGROUND_TASK';

export const handler: TaskManager.TaskManagerTaskExecutor = async () => {
  console.log('[PrayerReminderTask] Running prayer reminder task');

  try {
    await scheduleTodayNotifications();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error('[PrayerReminderTask] Task failed:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
};

export const options: BackgroundTask.BackgroundTaskOptions = {
  minimumInterval: 60 * 60 * 24, // Run once per day (24 hours in seconds)
};
