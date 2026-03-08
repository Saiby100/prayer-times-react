import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from '@rneui/themed';

import Page from '@/components/Page';

export default function Settings() {
  const { theme } = useTheme();

  return (
    <Page
      name="settings"
      title="Settings"
      options={{
        headerBackVisible: true,
      }}
    >
      <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
        <View style={[styles.card, { backgroundColor: theme.colors.bgLight }]}>
          <Text style={styles.sectionTitle}>Prayer Reminder</Text>

          <Text style={styles.label}>Notify me:</Text>

          <Text style={[styles.value, { color: theme.colors.primary }]}>5 minutes before</Text>

          <Text style={[styles.hint, { opacity: 0.6 }]}>
            You will receive a notification 5 minutes before each prayer time
          </Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
