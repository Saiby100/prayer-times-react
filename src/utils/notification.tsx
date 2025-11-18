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

async function schedulePushNotification(title: string, body: string, date: Date) {
  if (!(await notificationPermissionGranted())) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
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

export {
  createNotificationChannel,
  notificationPermissionGranted,
  schedulePushNotification,
  requestNotificationPermission,
};
