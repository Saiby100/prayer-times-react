import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

async function createTask(taskName: string, taskFn: (param: Record<string, any>) => Promise<void>) {
  TaskManager.defineTask(taskName, async (param) => {
    try {
      await taskFn(param);
    } catch (error) {
      console.error(`Error executing task ${taskName}:`, error);
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
    return BackgroundTask.BackgroundTaskResult.Success;
  });
}

function registerBackgroundTask(taskName: string) {
  return BackgroundTask.registerTaskAsync(taskName);
}

function registerNotificationTask(taskName: string) {
  return Notifications.registerTaskAsync(taskName);
}

export { createTask, registerBackgroundTask, registerNotificationTask };
