import * as Notifications from 'expo-notifications';

const ALARM_CATEGORY_ID = 'prayer_alarm';

/** Registers a notification category with a Dismiss action button for alarm notifications. */
async function registerAlarmCategory() {
  await Notifications.setNotificationCategoryAsync(ALARM_CATEGORY_ID, [
    {
      identifier: 'dismiss',
      buttonTitle: 'Dismiss',
      options: { opensAppToForeground: false },
    },
  ]);
}

export { ALARM_CATEGORY_ID, registerAlarmCategory };
