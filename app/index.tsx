import { useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { getArea } from '@/stores';
import * as SplashScreen from 'expo-splash-screen';
import { registerDefinedTask } from '@/backgroundTasks';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';
import log from '@/utils/logger';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    log.info('index: app init started', { type: 'app' });

    // Register background task for daily notification scheduling
    registerDefinedTask.prayerReminderTask();

    // Schedule today's notifications immediately on app open
    scheduleTodayNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const area = getArea();

      if (area) {
        router.replace('/home');
      } else {
        router.replace('/areas');
      }
    }, [])
  );

  return;
}
