import { useEffect, useCallback, useRef } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import getStorage from '@/utils/localStore';
import { useThemeMode, ThemeMode } from '@rneui/themed';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const { setMode } = useThemeMode();
  const storage = useRef(getStorage());

  useEffect(() => {
    const themeMode = storage.current.getString('themeMode') as ThemeMode;

    if (!themeMode) storage.current.set('themeMode', 'light');
    setMode(themeMode || 'light');
  });

  useFocusEffect(
    useCallback(() => {
      const area = storage.current.getString('area');

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
