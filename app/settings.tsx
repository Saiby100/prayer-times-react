import { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Slider, useTheme, useThemeMode } from '@rneui/themed';

import Page from '@/components/Page';
import getStorage from '@/utils/localStore';
import globalStyles from '@/utils/globalStyles';

const REMINDER_OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60];

export default function Settings() {
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const storage = useRef(getStorage());

  const [reminderMinutes, setReminderMinutes] = useState<number>(5);
  const [sliderIndex, setSliderIndex] = useState<number>(1);

  useEffect(() => {
    const savedMinutes = storage.current.getNumber('prayerReminderPref') ?? 5;
    setReminderMinutes(savedMinutes);
    const index = REMINDER_OPTIONS.indexOf(savedMinutes);
    setSliderIndex(index >= 0 ? index : 1);
  }, []);

  const handleSliderChange = (value: number) => {
    const index = Math.round(value);
    setSliderIndex(index);
    const minutes = REMINDER_OPTIONS[index];
    setReminderMinutes(minutes);
  };

  const handleSliderComplete = (value: number) => {
    const index = Math.round(value);
    const minutes = REMINDER_OPTIONS[index];
    storage.current.set('prayerReminderPref', minutes);
  };

  const shadow = mode === 'light' ? styles.shadow : {};

  const getReminderLabel = (minutes: number) => {
    if (minutes === 0) return 'At prayer time';
    if (minutes === 60) return '1 hour before';
    return `${minutes} minutes before`;
  };

  return (
    <Page
      name="settings"
      title="Settings"
      options={{
        headerBackVisible: true,
      }}
    >
      <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
        <View style={[shadow, styles.card, { backgroundColor: theme.colors.bgLight }]}>
          <Text style={[globalStyles.text, styles.sectionTitle, { color: theme.colors.text }]}>
            Prayer Reminder
          </Text>

          <Text style={[globalStyles.text, styles.label, { color: theme.colors.text }]}>
            Notify me:
          </Text>

          <Text style={[globalStyles.text, styles.value, { color: theme.colors.primary }]}>
            {getReminderLabel(reminderMinutes)}
          </Text>

          <View style={styles.sliderContainer}>
            <Slider
              value={sliderIndex}
              onValueChange={handleSliderChange}
              onSlidingComplete={handleSliderComplete}
              minimumValue={0}
              maximumValue={REMINDER_OPTIONS.length - 1}
              step={1}
              allowTouchTrack
              trackStyle={styles.track}
              thumbStyle={[styles.thumb, { backgroundColor: theme.colors.primary }]}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={mode === 'light' ? '#d3d3d3' : '#555555'}
            />
            <View style={styles.tickLabels}>
              <Text style={[styles.tickLabel, { color: theme.colors.text }]}>0</Text>
              <Text style={[styles.tickLabel, { color: theme.colors.text }]}>15</Text>
              <Text style={[styles.tickLabel, { color: theme.colors.text }]}>30</Text>
              <Text style={[styles.tickLabel, { color: theme.colors.text }]}>60</Text>
            </View>
          </View>

          <Text style={[styles.hint, { color: theme.colors.text, opacity: 0.6 }]}>
            You will receive a notification before each prayer time
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
  shadow: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
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
  sliderContainer: {
    paddingHorizontal: 10,
  },
  track: {
    height: 6,
    borderRadius: 3,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  tickLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  tickLabel: {
    fontSize: 12,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});