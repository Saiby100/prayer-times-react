import { useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { getArea } from '@/stores';
import * as SplashScreen from 'expo-splash-screen';
import { registerDefinedTask } from '@/backgroundTasks';
import { syncPrayerReminders } from '@/services/notifications/scheduleReminders';
import { ensureChannelsExist } from '@/services/notifications/setup';
import { useStartupUpdate } from '@/hooks/useStartupUpdate';
import UpdatingScreen from '@/components/UpdatingScreen';
import log from '@/utils/logger';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const updatePhase = useStartupUpdate();
  const isReady = updatePhase === 'ready';
  const isUpdating = updatePhase === 'updating';

  useEffect(() => {
    if (isUpdating) SplashScreen.hide();
  }, [isUpdating]);

  // Wait for the launch update, so init doesn't run twice when the app reloads onto it.
  useEffect(() => {
    if (!isReady) return;
    async function init() {
      log.info('index: app init started', { type: 'init-app' });
      registerDefinedTask.prayerReminderTask();
      await ensureChannelsExist();
      syncPrayerReminders();
    }
    init();
  }, [isReady]);

  useFocusEffect(
    useCallback(() => {
      if (!isReady) return;
      const area = getArea();

      if (area) {
        router.replace('/home');
      } else {
        router.replace('/areas');
      }
    }, [isReady])
  );

  if (isUpdating) return <UpdatingScreen />;
  return null;
}
