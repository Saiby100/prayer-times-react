import { ScrollView, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

import Page from '@/components/Page';
import Card from '@/components/Card';
import SettingsInfoRow from '@/components/SettingsInfoRow';

export default function AboutSettings() {
  return (
    <Page
      name="settings/about"
      title="About"
      options={{ headerBackVisible: true }}
      contentStyle={styles.content}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Card gap={16}>
          <SettingsInfoRow label="Version" value={Constants.expoConfig?.version ?? '-'} />
        </Card>
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  container: {
    paddingHorizontal: 24,
    gap: 16,
  },
});
