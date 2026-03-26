import React from 'react';
import {
  Dimensions,
  ImageBackground,
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
  children?: React.ReactNode;
  title?: string;
  contentStyle?: StyleProp<ViewStyle>;
  showBackground?: boolean;
  error?: boolean;
  onRetry?: () => void;
};

const Page = ({
  children,
  name,
  options,
  title,
  contentStyle,
  showBackground,
  error,
  onRetry,
}: PageProps) => {
  const { theme } = useTheme();
  const { backgroundSource } = useBackgroundImage();

  const headerOptions = {
    title,
    headerShown: true,
    headerTitleStyle: { fontSize: 18, fontFamily: 'Inter-Medium', color: theme.colors.text },
    headerStyle: { backgroundColor: theme.colors.bgLight },
    headerTintColor: theme.colors.text,
    ...options,
  };

  const content = error && onRetry ? <NetworkError error={error} onRetry={onRetry} /> : children;
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
});
