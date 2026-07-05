import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import Page from '@/components/Page';
import Card from '@/components/Card';
import SettingsToggleRow from '@/components/SettingsToggleRow';
import ConfirmPopup from '@/components/ConfirmPopup';
import useDisabledPrayers from '@/hooks/notifications/useDisabledPrayers';

export default function PreferenceSettings() {
  const { disabledPrayers, resetAll } = useDisabledPrayers();
  const [resetPopupVisible, setResetPopupVisible] = useState(false);

  return (
    <Page
      name="settings/preferences"
      title="Preferences"
      options={{ headerBackVisible: true }}
      contentStyle={styles.content}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Card gap={16}>
          <SettingsToggleRow
            label="Hidden prayers"
            iconName="eye-off"
            title={` ${disabledPrayers.length} hidden`}
            disabled={disabledPrayers.length === 0}
            onPress={() => setResetPopupVisible(true)}
          />
        </Card>
      </ScrollView>
      <ConfirmPopup
        visible={resetPopupVisible}
        title="Reset hidden prayers?"
        message="All hidden prayers will be visible on the home screen again."
        confirmLabel="Reset"
        dismissLabel="Cancel"
        onConfirm={() => {
          setResetPopupVisible(false);
          resetAll();
        }}
        onDismiss={() => setResetPopupVisible(false)}
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
