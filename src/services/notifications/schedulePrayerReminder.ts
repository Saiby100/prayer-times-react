import { schedulePushNotification } from '@/services/notifications/notification';
import { PrayerReminder } from '@/types/notifications';

async function schedulePrayerReminder({ todayTimes, formattedTimes, offset }: PrayerReminder) {
  const prayerNames = Object.keys(todayTimes);
  if (offset >= prayerNames.length) return;

  const prayerName = prayerNames[offset];
  await schedulePushNotification({
    title: `${prayerName} Reminder`,
    body: `${prayerName} prayer at ${todayTimes[prayerName]}.`,
    data: { offset: offset + 1, todayTimes, formattedTimes },
    date: formattedTimes[prayerName],
  });
}

export default schedulePrayerReminder;
