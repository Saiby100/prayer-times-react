import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, ScreenProps } from 'expo-router';
import { useTheme } from '@rneui/themed';
import globalStyles from '@/utils/globalStyles';

type Page = ScreenProps & {
  children?: React.ReactNode;
};

const Page: React.FC<Page> = ({ children, name, options }) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ ...styles.view, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        name={name}
        options={{
          headerShown: true,
          headerTitleStyle: { ...globalStyles.text, color: theme.colors.text },
          headerStyle: { backgroundColor: theme.colors.bgLight },
          headerTintColor: theme.colors.text,
          ...options,
        }}
      />
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
});
