import { getNotificationType } from '@/stores';
import { schedulePushNotification } from './notification';
import { scheduleAlarmNotification } from './alarmNotification';
import { ensureChannelsExist } from './setup';

async function sendTestNotification() {
  await ensureChannelsExist();
  const date = new Date(Date.now() + 5000);
  const type = getNotificationType();

  if (type === 'alarm') {
    await scheduleAlarmNotification({
      title: 'Test Alarm',
      body: 'This is a test alarm notification.',
      data: { type: 'prayer_reminder', prayer: 'Test' },
      date,
    });
  } else {
    await schedulePushNotification({
      title: 'Test Notification',
      body: 'This is a test notification.',
      data: { type: 'prayer_reminder', prayer: 'Test' },
      date,
      channelId: 'prayer_reminder',
    });
  }
}

export { sendTestNotification };
