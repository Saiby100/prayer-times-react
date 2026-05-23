import { Platform } from 'react-native';
import { createNotificationChannel, notificationPermissionGranted } from './notification';
import { createAlarmChannel } from './alarmNotification';

async function ensureChannelsExist() {
  if (!(await notificationPermissionGranted())) return;
  if (Platform.OS !== 'android') return;

  await Promise.all([
    createNotificationChannel({
      channelId: 'prayer_reminder',
      name: 'Prayer reminder notifications',
    }),
    createAlarmChannel(),
  ]);
}

export { ensureChannelsExist };
