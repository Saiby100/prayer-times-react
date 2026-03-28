import { Stack } from 'expo-router';
import { useTheme } from '@rneui/themed';

export default function QuranLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        navigationBarColor: theme.colors.background,
      }}
    />
  );
}
