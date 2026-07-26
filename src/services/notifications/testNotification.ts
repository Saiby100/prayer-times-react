import { schedulePushNotification } from './notification';
import { ensureChannelsExist } from './setup';

async function sendTestNotification() {
  await ensureChannelsExist();
  const date = new Date(Date.now() + 5000);

  await schedulePushNotification({
    title: 'Test Notification',
    body: 'This is a test notification.',
    data: { type: 'prayer_reminder', prayer: 'Test' },
    date,
    channelId: 'prayer_reminder',
  });
}

export { sendTestNotification };
