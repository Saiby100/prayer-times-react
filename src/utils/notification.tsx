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
  if (Platform.OS !== 'android') return;

  const notificationChannel = await Notifications.getNotificationChannelAsync(channelId);
  if (notificationChannel) return;

  await Notifications.setNotificationChannelAsync(channelId, {
    name,
    importance: Notifications.AndroidImportance.MAX,
  });
}

async function schedulePushNotification(title: string, body: string, date: Date) {
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

async function notificationPermissionGranted(request = false) {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus !== 'granted' && request) {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }
  return existingStatus === 'granted';
}

export { createNotificationChannel, notificationPermissionGranted, schedulePushNotification };
