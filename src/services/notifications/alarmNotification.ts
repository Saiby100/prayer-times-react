import notifee, {
  AndroidImportance,
  AndroidCategory,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';

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

  return await notifee.createTriggerNotification(
    {
      title,
      body,
      data: data ?? {},
      android: {
        channelId: ALARM_CHANNEL_ID,
        category: AndroidCategory.ALARM,
        sound: 'alarm',
        ongoing: true,
        autoCancel: false,
        importance: AndroidImportance.HIGH,
        flags: [4], // FLAG_INSISTENT — loops the sound until dismissed
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
