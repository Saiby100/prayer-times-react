import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

import Page from '@/components/Page';
import Card from '@/components/Card';
import SettingsToggleRow from '@/components/SettingsToggleRow';
import SettingsInfoRow from '@/components/SettingsInfoRow';
import ConfirmPopup from '@/components/ConfirmPopup';
import useReleaseUpdate, { type ReleaseCheckStatus } from '@/hooks/useReleaseUpdate';

const updateIconName: Record<ReleaseCheckStatus, string> = {
  idle: 'download',
  checking: 'download',
  'up-to-date': 'check-circle',
  'update-available': 'arrow-up-circle',
  error: 'alert-circle',
};

const updateTitle: Record<ReleaseCheckStatus, string> = {
  idle: ' Check for updates',
  checking: ' Checking...',
  'up-to-date': ' Up to date',
  'update-available': ' Update available',
  error: ' Check failed',
};

export default function AboutSettings() {
  const { latestVersion, checkStatus, loading, checkForUpdate, downloadUpdate } =
    useReleaseUpdate();
  const [updatePopupVisible, setUpdatePopupVisible] = useState(false);

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
          <SettingsToggleRow
            label="Updates"
            iconName={updateIconName[checkStatus]}
            title={updateTitle[checkStatus]}
            loading={loading}
            disabled={loading}
            onPress={async () => {
              if (checkStatus === 'update-available') {
                setUpdatePopupVisible(true);
              } else {
                const found = await checkForUpdate();
                if (found) setUpdatePopupVisible(true);
              }
            }}
          />
        </Card>
      </ScrollView>
      <ConfirmPopup
        visible={updatePopupVisible}
        title="Update Available"
        message={`Version ${latestVersion} is ready to download.`}
        confirmLabel="Download"
        dismissLabel="Cancel"
        onConfirm={() => {
          setUpdatePopupVisible(false);
          downloadUpdate();
        }}
        onDismiss={() => setUpdatePopupVisible(false)}
      />
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
