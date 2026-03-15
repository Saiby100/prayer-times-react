import { useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import getStorage from '@/utils/localStore';
import * as SplashScreen from 'expo-splash-screen';
import { registerDefinedTask } from '@/backgroundTasks';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';
import useUpdates from '@/hooks/useUpdates';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const storage = getStorage();
  const { checkForUpdates } = useUpdates();

  useEffect(() => {
    // Register background task for daily notification scheduling
    registerDefinedTask.prayerReminderTask();

    // Schedule today's notifications immediately on app open
    scheduleTodayNotifications();

    // Auto-check for OTA updates (only in production builds with a channel)
    checkForUpdates();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const area = storage.getString('area');

      if (area) {
        router.replace('/areas');
        router.push({ pathname: '/home', params: { area } });
      } else {
        router.replace('/areas');
      }
    }, [])
  );

  return;
}
