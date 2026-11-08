import { useCallback, useEffect, useState } from 'react';
import { AppState, ToastAndroid } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  canUseFullScreenIntent,
  openFullScreenIntentSettings,
  testAlarm as nativeTestAlarm,
} from '@/services/alarms/alarm';
import { getNotificationPermission } from '@/services/notifications/notification';
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

  // Rings the real alarm 5 seconds from now, whichever reminder type is picked.
  async function testAlarm() {
    try {
      await nativeTestAlarm();
      ToastAndroid.show('Test alarm rings in 5 seconds', ToastAndroid.SHORT);
    } catch (error) {
      log.warn('useAlarmPermissions: failed to schedule test alarm', {
        type: 'test-alarm',
        error: String(error),
      });
      ToastAndroid.show("Couldn't set the test alarm", ToastAndroid.SHORT);
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

  return { canFullScreen, notificationsAllowed, testAlarm, openFullScreenSettings };
}

export default useAlarmPermissions;
