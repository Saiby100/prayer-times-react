import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let handlerSet = false;

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

type ChannelOptions = {
  /** Android notification channel ID. */
  channelId: string;
  /** Human-readable channel name. */
  name: string;
  /** Custom sound filename (e.g. 'alarm.wav'). */
  sound?: string;
  /** Route audio through the alarm stream so it respects alarm volume. */
  useAlarmStream?: boolean;
  /** Whether the channel should bypass Do Not Disturb. */
  bypassDnd?: boolean;
};

async function createNotificationChannel({
  channelId,
  name,
  sound,
  useAlarmStream,
  bypassDnd,
}: ChannelOptions) {
  if (!(await notificationPermissionGranted())) return;
  if (Platform.OS !== 'android') return;

  // Delete existing channel so updated sound/audio settings take effect
  // (Android channels are immutable after creation)
  await Notifications.deleteNotificationChannelAsync(channelId);

  await Notifications.setNotificationChannelAsync(channelId, {
    name,
    importance: Notifications.AndroidImportance.MAX,
    ...(sound && { sound }),
    ...(bypassDnd && { bypassDnd: true }),
    enableVibrate: true,
    ...(useAlarmStream && {
      audioAttributes: {
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
    }),
  });
}

async function schedulePushNotification({
  title,
  body,
  data,
  date,
  channelId,
  priority,
  sticky,
  sound,
  categoryIdentifier,
}: {
  /** Notification heading. */
  title: string;
  /** Notification body text. */
  body: string;
  /** Extra data attached to the notification. */
  data?: Record<string, unknown>;
  /** When the notification should fire. */
  date: Date;
  /** Android notification channel ID. */
  channelId?: string;
  /** Android notification priority. */
  priority?: Notifications.AndroidNotificationPriority;
  /** When true the notification stays until the user dismisses it. */
  sticky?: boolean;
  /** Custom sound filename (e.g. 'alarm.wav'). Used on iOS; Android uses channel sound. */
  sound?: string;
  /** Notification category identifier for action buttons. */
  categoryIdentifier?: string;
}) {
  if (!(await notificationPermissionGranted())) return null;
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      ...(priority && { priority }),
      ...(channelId && { channelId }),
      ...(sticky && { sticky }),
      ...(sound && { sound }),
      ...(categoryIdentifier && { categoryIdentifier }),
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

async function clearScheduledNotifications(ids: string[]) {
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
