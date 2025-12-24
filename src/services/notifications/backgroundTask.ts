import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import PTApi from '@/utils/PTApi';
import getStorage from '@/utils/localStore';
import {
  schedulePushNotification,
  clearScheduledNotifications,
  getScheduledNotifications,
} from './notification';

const PRAYER_REMINDER_TASK = 'PRAYER_REMINDER_BACKGROUND_TASK';

// Format prayer times with minutes before preference
function formatPrayerTimes(
  todayTimes: Record<string, string>,
  minutesBefore: number
): Record<string, Date> {
  const result: Record<string, Date> = {};

  for (const [prayerName, timeString] of Object.entries(todayTimes)) {
    if (!timeString) {
      continue;
    }

    const dateTime = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    dateTime.setHours(hours, minutes - minutesBefore, 0, 0);
    result[prayerName] = dateTime;
  }

  return result;
}

// Fetch prayer times for today
async function fetchTodayPrayerTimes(): Promise<Record<string, string> | null> {
  const storage = getStorage();
  const area = storage.getString('area');

  if (!area) {
    console.log('[BackgroundTask] No area configured');
    return null;
  }

  const today = new Date();
  const cacheKey = `times_${today.getMonth()}_${today.getFullYear()}_${area}`;

  // Try to get from cache first
  if (storage.contains(cacheKey)) {
    const timesData = storage.getString(cacheKey);
    if (timesData) {
      const times = JSON.parse(timesData);
      return times[today.getDate() - 1];
    }
  }

  // Fetch from API if not in cache
  try {
    const api = new PTApi();
    api.setArea(area);
    const times = await api.fetchTimes(today);

    if (times && times.length > 0) {
      // Cache the data
      storage.set(cacheKey, JSON.stringify(times));
      return times[today.getDate() - 1] as Record<string, string>;
    }
  } catch (error) {
    console.error('[BackgroundTask] Error fetching times:', error);
  }

  return null;
}

// Clear existing prayer reminders
async function clearExistingReminders(): Promise<void> {
  const scheduled = await getScheduledNotifications();
  const prayerReminders = scheduled.filter((n) => n.content.data?.type === 'prayer_reminder');
  const ids = prayerReminders.map((n) => n.identifier);

  if (ids.length > 0) {
    await clearScheduledNotifications(ids);
    console.log(`[BackgroundTask] Cleared ${ids.length} existing reminders`);
  }
}

// Schedule notifications for today's prayers
async function scheduleTodayNotifications(): Promise<string[]> {
  const storage = getStorage();
  const remindersEnabled = storage.getBoolean('remindersEnabled') ?? false;

  if (!remindersEnabled) {
    console.log('[BackgroundTask] Reminders are disabled');
    return [];
  }

  const todayTimes = await fetchTodayPrayerTimes();
  if (!todayTimes) {
    console.log('[BackgroundTask] Could not fetch prayer times');
    return [];
  }

  const minutesBefore = storage.getNumber('prayerReminderPref') ?? 5;
  const formattedTimes = formatPrayerTimes(todayTimes, minutesBefore);

  // Clear existing reminders first
  await clearExistingReminders();

  // Schedule new notifications
  const now = new Date();
  const scheduledIds: string[] = [];

  for (const [prayerName, reminderTime] of Object.entries(formattedTimes)) {
    // Only schedule if the reminder time is in the future
    if (reminderTime <= now) {
      console.log(`[BackgroundTask] Skipping ${prayerName} - time has passed`);
      continue;
    }

    const id = await schedulePushNotification({
      title: `${prayerName} Reminder`,
      body: `${prayerName} prayer at ${todayTimes[prayerName]}.`,
      data: { type: 'prayer_reminder', prayer: prayerName },
      date: reminderTime,
    });

    if (id) {
      scheduledIds.push(id);
      console.log(
        `[BackgroundTask] Scheduled ${prayerName} for ${reminderTime.toLocaleTimeString()}`
      );
    }
  }

  console.log(`[BackgroundTask] Scheduled ${scheduledIds.length} notifications`);
  return scheduledIds;
}

// Define the background task
TaskManager.defineTask(PRAYER_REMINDER_TASK, async () => {
  console.log('[BackgroundTask] Running prayer reminder task');

  try {
    await scheduleTodayNotifications();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error('[BackgroundTask] Task failed:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

// Register the background task to run daily
export async function registerBackgroundTask(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(PRAYER_REMINDER_TASK);

    if (isRegistered) {
      console.log('[BackgroundTask] Task already registered');
      return;
    }

    await BackgroundTask.registerTaskAsync(PRAYER_REMINDER_TASK, {
      minimumInterval: 60 * 60 * 24, // Run once per day (24 hours in seconds)
    });

    console.log('[BackgroundTask] Task registered successfully');
  } catch (error) {
    console.error('[BackgroundTask] Failed to register task:', error);
  }
}

// Unregister the background task
export async function unregisterBackgroundTask(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(PRAYER_REMINDER_TASK);

    if (!isRegistered) {
      console.log('[BackgroundTask] Task not registered');
      return;
    }

    await BackgroundTask.unregisterTaskAsync(PRAYER_REMINDER_TASK);
    console.log('[BackgroundTask] Task unregistered successfully');
  } catch (error) {
    console.error('[BackgroundTask] Failed to unregister task:', error);
  }
}

// Check if the background task is registered
export async function isBackgroundTaskRegistered(): Promise<boolean> {
  return await TaskManager.isTaskRegisteredAsync(PRAYER_REMINDER_TASK);
}

// Manually trigger notification scheduling (for use when app is open)
export { scheduleTodayNotifications };
