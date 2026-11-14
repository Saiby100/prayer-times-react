import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { canUseFullScreenIntent, openFullScreenIntentSettings } from '@/services/alarms/alarm';
import { getNotificationPermission } from '@/services/notifications/notification';
import log from '@/utils/logger';

/**
 * The permissions prayer alarms need: full-screen access for the ringing screen, and
 * notifications. Both can change in Android settings while the app is in the background, so
 * they're checked again when the screen using this regains focus and when the app returns to
 * the foreground.
 */
function useAlarmPermissions() {
  const [canFullScreen, setCanFullScreen] = useState(canUseFullScreenIntent);
  // Assume allowed until checked, so Preview reminder doesn't flash disabled on open.
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

  function openFullScreenSettings() {
    openFullScreenIntentSettings().catch((error) => {
      log.warn('useAlarmPermissions: failed to open full-screen settings', {
        type: 'open-full-screen-settings',
        error: String(error),
      });
    });
  }

  return { canFullScreen, notificationsAllowed, openFullScreenSettings };
}

export default useAlarmPermissions;
