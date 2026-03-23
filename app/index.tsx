import { useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import getStorage from '@/utils/localStore';
import * as SplashScreen from 'expo-splash-screen';
import { registerDefinedTask } from '@/backgroundTasks';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';
import log from '@/utils/logger';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const storage = getStorage();
  useEffect(() => {
    log.info('index: app init started', { type: 'app' });

    // Register background task for daily notification scheduling
    registerDefinedTask.prayerReminderTask();

    // Schedule today's notifications immediately on app open
    scheduleTodayNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const area = storage.getString('area');

      if (area) {
        router.replace('/home');
      } else {
        router.replace('/areas');
      }
    }, [])
  );

  return;
}
