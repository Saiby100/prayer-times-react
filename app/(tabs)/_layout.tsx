import { Tabs } from 'expo-router';
import { Icon, useTheme } from '@rneui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Extra space between the tab labels and the system navigation bar */
const EXTRA_BOTTOM_SPACE = 6;

export default function TabsLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      safeAreaInsets={{ bottom: insets.bottom + EXTRA_BOTTOM_SPACE }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text + '80',
        // The navigator pads the bar by safeAreaInsets.bottom with edge-to-edge
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
    </Tabs>
  );
}
