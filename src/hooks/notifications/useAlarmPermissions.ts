import { useCallback, useEffect, useState } from 'react';
import { AppState, ToastAndroid } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  canUseFullScreenIntent,
  openFullScreenIntentSettings,
  testAlarm as nativeTestAlarm,
} from '@/services/alarms/alarm';
import { getNotificationPermission } from '@/services/notifications/notification';
import { sendPreviewNotification } from '@/services/notifications/testNotification';
import type { ReminderType } from '@/stores';
import log from '@/utils/logger';

/**
 * The permissions prayer alarms need, for the Notifications settings screen. Both can change in
 * Android settings while the app is in the background, so they're checked again when the screen
 * regains focus and when the app returns to the foreground.
 */
function useAlarmPermissions() {
  const [canFullScreen, setCanFullScreen] = useState(canUseFullScreenIntent);
  // Assume allowed until checked, so Test alarm doesn't flash disabled on open.
  const [notificationsAllowed, setNotificationsAllowed] = useState(true);

  const refresh = useCallback(async () => {
    setCanFullScreen(canUseFullScreenIntent());
    const { granted } = await getNotificationPermission();
    setNotificationsAllowed(granted);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  // Sends a reminder of this type 5 seconds from now: the test alarm or a preview notification.
  async function previewReminder(type: ReminderType) {
    try {
      if (type === 'alarm') await nativeTestAlarm();
      else await sendPreviewNotification();
      ToastAndroid.show('Reminder preview in 5 seconds', ToastAndroid.SHORT);
    } catch (error) {
      log.warn('useAlarmPermissions: failed to schedule reminder preview', {
        type: 'preview-reminder',
        reminderType: type,
        error: String(error),
      });
      ToastAndroid.show("Couldn't send the reminder preview", ToastAndroid.SHORT);
    }
  }

  function openFullScreenSettings() {
    openFullScreenIntentSettings().catch((error) => {
      log.warn('useAlarmPermissions: failed to open full-screen settings', {
        type: 'open-full-screen-settings',
        error: String(error),
      });
    });
  }

  return { canFullScreen, notificationsAllowed, previewReminder, openFullScreenSettings };
}

export default useAlarmPermissions;
