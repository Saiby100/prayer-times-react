import { Linking, ScrollView, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

import Page from '@/components/Page';
import Card from '@/components/Card';
import SettingsInfoRow from '@/components/SettingsInfoRow';
import SettingsMenuRow from '@/components/SettingsMenuRow';
import { PRAYER_TIMES_SOURCE_URL, PRIVACY_POLICY_URL } from '@/config/links';
import { PLAY_STORE_URL } from '@/config/shareApp';

const openUrl = (url: string) => {
  Linking.openURL(url).catch(() => {});
};

export default function AboutSettings() {
  return (
    <Page title="About" options={{ headerBackVisible: true }} contentStyle={styles.content}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card gap={16}>
          <SettingsInfoRow label="Version" value={Constants.expoConfig?.version ?? '-'} />
        </Card>
        <Card gap={16}>
          <SettingsMenuRow
            label="Prayer times: masjids.co.za"
            iconName="clock"
            trailingIconName="external-link"
            onPress={() => openUrl(PRAYER_TIMES_SOURCE_URL)}
          />
          <SettingsMenuRow
            label="Privacy policy"
            iconName="shield"
            trailingIconName="external-link"
            onPress={() => openUrl(PRIVACY_POLICY_URL)}
          />
          <SettingsMenuRow
            label="Rate the app"
            iconName="star"
            trailingIconName="external-link"
            onPress={() => openUrl(PLAY_STORE_URL)}
          />
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
