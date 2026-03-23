import React from 'react';
import { ImageBackground, StatusBar, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, ScreenProps } from 'expo-router';
import { useTheme } from '@rneui/themed';
import useBackgroundImage from '@/hooks/useBackgroundImage';

type Page = ScreenProps & {
  children?: React.ReactNode;
  title?: string;
  contentStyle?: StyleProp<ViewStyle>;
  showBackground?: boolean;
};

const Page: React.FC<Page> = ({ children, name, options, title, contentStyle, showBackground }) => {
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

  const useBackground = showBackground && backgroundSource;

  if (useBackground) {
    return (
      <SafeAreaView style={[styles.view, contentStyle]}>
        <Stack.Screen name={name} options={headerOptions} />
        <StatusBar backgroundColor={theme.colors.background} />
        <ImageBackground source={backgroundSource} resizeMode="cover" style={styles.background}>
          {children}
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.view, { backgroundColor: theme.colors.background }, contentStyle]}>
      <Stack.Screen name={name} options={headerOptions} />
      <StatusBar backgroundColor={theme.colors.background} />
      {children}
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
