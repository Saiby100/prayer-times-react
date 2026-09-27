import { Platform } from 'react-native';
import { createNotificationChannel, notificationPermissionGranted } from './notification';

async function ensureChannelsExist() {
  if (!(await notificationPermissionGranted())) return;
  if (Platform.OS !== 'android') return;

  await createNotificationChannel({
    channelId: 'prayer_reminder',
    name: 'Prayer reminder notifications',
  });
}

export { ensureChannelsExist };
