import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { registerTask } from './utils';

// Import all tasks
import * as prayerReminderTask from './tasks/prayerReminderTask';

// Re-export utilities
export { registerTask, unregisterTask, isTaskRegistered } from './utils';

// Define all tasks
TaskManager.defineTask(prayerReminderTask.NAME, prayerReminderTask.handler);

// Export a mapping of task registration functions
export const registerDefinedTask = {
  prayerReminderTask: async (options?: BackgroundTask.BackgroundTaskOptions) => {
    await registerTask(prayerReminderTask.NAME, options ?? prayerReminderTask.options ?? {});
  },
};
