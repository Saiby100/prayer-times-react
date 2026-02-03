import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

export async function registerTask(
  taskName: string,
  options: BackgroundTask.BackgroundTaskOptions = {}
): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);

    if (isRegistered) {
      console.log(`[BackgroundTask] Task "${taskName}" already registered`);
      return;
    }

    await BackgroundTask.registerTaskAsync(taskName, options);
    console.log(`[BackgroundTask] Task "${taskName}" registered successfully`);
  } catch (error) {
    console.error(`[BackgroundTask] Failed to register task "${taskName}":`, error);
  }
}

export async function unregisterTask(taskName: string): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);

    if (!isRegistered) {
      console.log(`[BackgroundTask] Task "${taskName}" not registered`);
      return;
    }

    await BackgroundTask.unregisterTaskAsync(taskName);
    console.log(`[BackgroundTask] Task "${taskName}" unregistered successfully`);
  } catch (error) {
    console.error(`[BackgroundTask] Failed to unregister task "${taskName}":`, error);
  }
}

export async function isTaskRegistered(taskName: string): Promise<boolean> {
  return await TaskManager.isTaskRegisteredAsync(taskName);
}