import notifee, {
  AndroidImportance,
  AndroidCategory,
  AndroidFlags,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';
import log from '@/utils/logger';

const ALARM_CHANNEL_ID = 'prayer_alarm_notifee';

type AlarmNotificationParams = {
  /** Notification heading. */
  title: string;
  /** Notification body text. */
  body: string;
  /** Extra data attached to the notification. */
  data?: Record<string, string>;
  /** When the notification should fire. */
  date: Date;
};

async function createAlarmChannel() {
  await notifee.deleteChannel(ALARM_CHANNEL_ID);

  await notifee.createChannel({
    id: ALARM_CHANNEL_ID,
    name: 'Prayer alarm notifications',
    sound: 'alarm',
    importance: AndroidImportance.HIGH,
    bypassDnd: true,
    vibration: true,
  });
}

async function scheduleAlarmNotification({
  title,
  body,
  data,
  date,
}: AlarmNotificationParams): Promise<string> {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
    alarmManager: { allowWhileIdle: true },
  };

  try {
    const id = await notifee.createTriggerNotification(
      {
        title,
        body,
        data: data ?? {},
        android: {
          channelId: ALARM_CHANNEL_ID,
          category: AndroidCategory.ALARM,
          sound: 'alarm',
          loopSound: true,
          ongoing: true,
          autoCancel: false,
          importance: AndroidImportance.HIGH,
          flags: [AndroidFlags.FLAG_INSISTENT],
          pressAction: { id: 'default' },
          actions: [
            {
              title: 'Dismiss',
              pressAction: { id: 'dismiss' },
            },
          ],
        },
      },
      trigger
    );
    log.info('alarmNotification: scheduled', {
      type: 'notification',
      id,
      date: date.toISOString(),
    });
    return id;
  } catch (error) {
    log.error('alarmNotification: failed to schedule', {
      type: 'notification',
      error: String(error),
    });
    throw error;
  }
}

async function cancelAllAlarmNotifications() {
  await notifee.cancelTriggerNotifications();
}

export {
  ALARM_CHANNEL_ID,
  createAlarmChannel,
  scheduleAlarmNotification,
  cancelAllAlarmNotifications,
};
