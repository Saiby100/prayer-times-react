import React from 'react';
import { StatusBar, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, ScreenProps } from 'expo-router';
import { useTheme } from '@rneui/themed';

type Page = ScreenProps & {
  children?: React.ReactNode;
  title?: string;
  contentStyle?: StyleProp<ViewStyle>;
};

const Page: React.FC<Page> = ({ children, name, options, title, contentStyle }) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.view, { backgroundColor: theme.colors.background }, contentStyle]}>
      <Stack.Screen
        name={name}
        options={{
          title,
          headerShown: true,
          headerTitleStyle: { fontSize: 18, fontFamily: 'Inter-Medium', color: theme.colors.text },
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
