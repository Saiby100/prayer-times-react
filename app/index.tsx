import { useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { getArea } from '@/stores';
import * as SplashScreen from 'expo-splash-screen';
import { registerDefinedTask } from '@/backgroundTasks';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';
import { ensureChannelsExist } from '@/services/notifications/setup';
import log from '@/utils/logger';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    async function init() {
      log.info('index: app init started', { type: 'app' });
      registerDefinedTask.prayerReminderTask();
      await ensureChannelsExist();
      scheduleTodayNotifications();
    }
    init();
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
