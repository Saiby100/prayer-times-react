import { useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import getStorage from '@/utils/localStore';
import { useThemeMode, ThemeMode } from '@rneui/themed';
import * as SplashScreen from 'expo-splash-screen';
import { registerDefinedTask } from '@/backgroundTasks';
import { scheduleTodayNotifications } from '@/services/notifications/scheduleReminders';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const { setMode } = useThemeMode();
  const storage = getStorage();

  useEffect(() => {
    const themeMode = storage.getString('themeMode') as ThemeMode;

    if (!themeMode) storage.set('themeMode', 'light');
    setMode(themeMode || 'light');

    // Register background task for daily notification scheduling
    registerDefinedTask.prayerReminderTask();

    // Schedule today's notifications immediately on app open
    scheduleTodayNotifications();
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
