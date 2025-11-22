import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

var handlerSet = false;

if (!handlerSet) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowAlert: true,
    }),
  });
  handlerSet = true;
}

async function createNotificationChannel(channelId: string, name: string) {
  if (!(await notificationPermissionGranted())) return;
  if (Platform.OS !== 'android') return;

  const notificationChannel = await Notifications.getNotificationChannelAsync(channelId);
  if (notificationChannel) return;

  await Notifications.setNotificationChannelAsync(channelId, {
    name,
    importance: Notifications.AndroidImportance.MAX,
  });
}

async function schedulePushNotification({
  title,
  body,
  data,
  date,
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  date: Date;
}) {
  if (!(await notificationPermissionGranted())) return null;
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });
}

async function notificationPermissionGranted() {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

async function requestNotificationPermission() {
  if (await notificationPermissionGranted()) return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function clearScheduledNotifications(ids: Array<string>) {
  await Promise.all(
    ids.map((id) => {
      Notifications.cancelScheduledNotificationAsync(id);
    })
  );
}

async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export {
  clearScheduledNotifications,
  createNotificationChannel,
  getScheduledNotifications,
  notificationPermissionGranted,
  requestNotificationPermission,
  schedulePushNotification,
};
