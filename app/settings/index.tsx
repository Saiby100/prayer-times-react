import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import Page from '@/components/Page';
import Card from '@/components/Card';
import SettingsMenuRow from '@/components/SettingsMenuRow';

export default function Settings() {
  const router = useRouter();

  return (
    <Page
      name="settings/index"
      title="Settings"
      options={{ headerBackVisible: true }}
      contentStyle={styles.content}
    >
      <Card gap={20} style={styles.card}>
        <SettingsMenuRow
          label="Appearance"
          iconName="image"
          onPress={() => router.push('/settings/appearance')}
        />
        <SettingsMenuRow
          label="Notifications"
          iconName="bell"
          onPress={() => router.push('/settings/notifications')}
        />
        <SettingsMenuRow
          label="Preferences"
          iconName="sliders"
          onPress={() => router.push('/settings/preferences')}
        />
        <SettingsMenuRow
          label="About"
          iconName="info"
          onPress={() => router.push('/settings/about')}
        />
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  card: {
    marginHorizontal: 24,
  },
});
