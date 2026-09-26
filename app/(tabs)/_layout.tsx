import { Tabs } from 'expo-router';
import { Icon, useTheme } from '@rneui/themed';

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        // The navigator applies the bottom inset itself with edge-to-edge
        tabBarStyle: {
          backgroundColor: theme.colors.bgLight,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarHideOnKeyboard: true,
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
        name="qibla"
        options={{
          title: 'Qibla',
          tabBarIcon: ({ color }) => <Icon name="compass" type="feather" color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="names"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
