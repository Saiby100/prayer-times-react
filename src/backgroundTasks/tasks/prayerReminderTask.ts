import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';
import { ensureChannelsExist } from '@/services/notifications/setup';
import log from '@/utils/logger';

export const NAME = 'PRAYER_REMINDER_BACKGROUND_TASK';

export const handler: TaskManager.TaskManagerTaskExecutor = async () => {
  log.info('prayerReminderTask: running background task', { type: 'background-task' });

  try {
    await ensureChannelsExist();
    await scheduleTodayNotifications();
    log.info('prayerReminderTask: task completed successfully', { type: 'background-task' });
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    log.error('prayerReminderTask: task failed', { type: 'background-task', error: String(error) });
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
};

export const options: BackgroundTask.BackgroundTaskOptions = {
  minimumInterval: 60 * 60 * 24, // Run once per day (24 hours in seconds)
};
