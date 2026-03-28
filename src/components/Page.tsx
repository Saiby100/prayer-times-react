import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  InteractionManager,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, ScreenProps } from 'expo-router';
import { useTheme } from '@rneui/themed';
import useBackgroundImage from '@/hooks/useBackgroundImage';
import NetworkError from '@/components/NetworkError';

type PageProps = ScreenProps & {
  /** Page content. */
  children?: React.ReactNode;
  /** Header title text. */
  title?: string;
  /** Additional styles applied to the content container. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Show the themed background image behind content. */
  showBackground?: boolean;
  /** Defer rendering children until navigation animations complete. */
  deferContent?: boolean;
  /** Whether an error occurred loading page data. */
  error?: boolean;
  /** Callback to retry after an error. */
  onRetry?: () => void;
};

const Page = ({
  children,
  name,
  options,
  title,
  contentStyle,
  showBackground,
  deferContent,
  error,
  onRetry,
}: PageProps) => {
  const { theme } = useTheme();
  const { backgroundSource } = useBackgroundImage();
  const [ready, setReady] = useState(!deferContent);

  useEffect(() => {
    if (!deferContent) return;
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task.cancel();
  }, [deferContent]);

  const headerOptions = {
    title,
    headerShown: true,
    headerTitleStyle: { fontSize: 18, fontFamily: 'Inter-Medium', color: theme.colors.text },
    headerStyle: { backgroundColor: theme.colors.bgLight },
    headerTintColor: theme.colors.text,
    ...options,
  };

  const content = !ready ? (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  ) : error && onRetry ? (
    <NetworkError error={error} onRetry={onRetry} />
  ) : (
    children
  );
  const useBackground = showBackground && backgroundSource;

  if (useBackground) {
    return (
      <View style={styles.view}>
        <ImageBackground
          source={backgroundSource}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, { height: Dimensions.get('screen').height }]}
        />
        <SafeAreaView style={[styles.view, contentStyle]}>
          <Stack.Screen name={name} options={headerOptions} />
          <StatusBar backgroundColor={theme.colors.background} />
          <View style={styles.background}>{content}</View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.view, { backgroundColor: theme.colors.background }, contentStyle]}>
      <Stack.Screen name={name} options={headerOptions} />
      <StatusBar backgroundColor={theme.colors.background} />
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
