import { useRef, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Slider, Text, useTheme } from '@rneui/themed';

import Page from '@/components/Page';
import getStorage from '@/utils/localStore';

const REMINDER_OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60];

export default function Settings() {
  const { theme } = useTheme();
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
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.bgLight, boxShadow: theme.colors.shadow },
          ]}
        >
          <Text style={styles.sectionTitle}>Prayer Reminder</Text>

          <Text style={styles.label}>Notify me:</Text>

          <Text style={[styles.value, { color: theme.colors.primary }]}>
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
            />
            <View style={styles.tickLabels}>
              <Text style={styles.tickLabel}>0</Text>
              <Text style={styles.tickLabel}>15</Text>
              <Text style={styles.tickLabel}>30</Text>
              <Text style={styles.tickLabel}>60</Text>
            </View>
          </View>

          <Text style={[styles.hint, { opacity: 0.6 }]}>
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