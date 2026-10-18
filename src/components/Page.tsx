import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  InteractionManager,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, ScreenProps } from 'expo-router';
import { useTheme } from '@rneui/themed';
import useAppearance from '@/hooks/useAppearance';
import ErrorMessage from '@/components/ErrorMessage';

type PageProps = {
  /** Screen options merged over the default header options. */
  options?: ScreenProps['options'];
  /** Page content. */
  children?: React.ReactNode;
  /** Header title text. */
  title?: string;
  /** Additional styles applied to the content container. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Show the themed background image behind content. */
  showBackground?: boolean;
  /** Show a loading spinner instead of children. */
  loading?: boolean;
  /** Defer rendering children until navigation animations complete. */
  deferContent?: boolean;
  /** Whether an error occurred loading page data. */
  error?: boolean;
  /** Callback to retry after an error. */
  onRetry?: () => void;
  /** Title of the error button. Defaults to 'Try again'. */
  retryTitle?: string;
};

const Page = ({
  children,
  options,
  title,
  contentStyle,
  showBackground,
  loading,
  deferContent,
  error,
  onRetry,
  retryTitle = 'Try again',
}: PageProps) => {
  const { theme } = useTheme();
  const { wallpaperSource, themeMode } = useAppearance();
  const [ready, setReady] = useState(!deferContent);

  useEffect(() => {
    if (!deferContent) return;
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task.cancel();
  }, [deferContent]);

  const headerOptions = {
    title,
    headerShown: true,
    headerTitleAlign: 'left' as const,
    headerTitleStyle: { fontSize: 18, fontFamily: 'Inter-Medium', color: theme.colors.text },
    headerTitleContainerStyle: { flex: 1 },
    headerStyle: { backgroundColor: theme.colors.bgLight },
    headerTintColor: theme.colors.text,
    ...options,
  };

  const content =
    !ready || loading ? (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    ) : error && onRetry ? (
      <ErrorMessage
        message="Couldn't load data. Check your connection."
        buttonTitle={retryTitle}
        onPress={onRetry}
      />
    ) : (
      children
    );
  const useBackground = showBackground && wallpaperSource;
  // Status bar is transparent with edge-to-edge; icon colour must follow the in-app theme
  const statusBarStyle = themeMode === 'dark' ? 'light' : 'dark';

  if (useBackground) {
    return (
      <View style={styles.view}>
        <ImageBackground
          source={wallpaperSource}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={[styles.view, contentStyle]}>
          <Stack.Screen options={headerOptions} />
          <StatusBar style={statusBarStyle} />
          <View style={styles.background}>{content}</View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.view, { backgroundColor: theme.colors.background }, contentStyle]}>
      <Stack.Screen options={headerOptions} />
      <StatusBar style={statusBarStyle} />
      {content}
    </SafeAreaView>
  );
};

export default Page;

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
