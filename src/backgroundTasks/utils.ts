import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import log from '@/utils/logger';

export async function registerTask(
  taskName: string,
  options: BackgroundTask.BackgroundTaskOptions = {}
): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);

    if (isRegistered) {
      log.debug('backgroundTask: task already registered', {
        type: 'background-task',
        task: taskName,
      });
      return;
    }

    await BackgroundTask.registerTaskAsync(taskName, options);
    log.info('backgroundTask: task registered', { type: 'background-task', task: taskName });
  } catch (error) {
    log.error('backgroundTask: failed to register task', {
      type: 'background-task',
      task: taskName,
      error: String(error),
    });
  }
}

export async function unregisterTask(taskName: string): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);

    if (!isRegistered) {
      log.debug('backgroundTask: task not registered', { type: 'background-task', task: taskName });
      return;
    }

    await BackgroundTask.unregisterTaskAsync(taskName);
    log.info('backgroundTask: task unregistered', { type: 'background-task', task: taskName });
  } catch (error) {
    log.error('backgroundTask: failed to unregister task', {
      type: 'background-task',
      task: taskName,
      error: String(error),
    });
  }
}

export async function isTaskRegistered(taskName: string): Promise<boolean> {
  return await TaskManager.isTaskRegisteredAsync(taskName);
}
