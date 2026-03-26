import { Tabs } from 'expo-router';
import { Icon, useTheme } from '@rneui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.bgLight,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Prayer Times',
          tabBarIcon: ({ color }) => <Icon name="clock" type="feather" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="names"
        options={{
          title: '99 Names of Allah',
          tabBarIcon: ({ color }) => (
            <Icon name="book-open" type="feather" color={color} size={20} />
          ),
        }}
      />
    </Tabs>
  );
}
