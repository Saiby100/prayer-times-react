import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import type { Colors } from '@rneui/themed';

type PrayerTimeRowProps = {
  /** Prayer name (e.g. "Fajr", "Zuhr"). */
  name: string;
  /** Formatted time string (e.g. "05:30"). */
  time: string;
  /** Whether this is the current/upcoming prayer. */
  isHighlighted: boolean;
  /** Theme colors object. */
  colors: Colors;
  /** Called on long-press to open settings popup. */
  onLongPress: () => void;
};

const PRAYER_ICONS: Record<string, string> = {
  Fajr: 'sunrise',
  Shuruq: 'sun',
  Zuhr: 'sun',
  Asr: 'cloud',
  Maghrib: 'sunset',
  Esha: 'moon',
};

const getPrayerIcon = (name: string) => PRAYER_ICONS[name] ?? 'clock';

const PrayerTimeRow = ({ name, time, isHighlighted, colors, onLongPress }: PrayerTimeRowProps) => (
  <Pressable
    onLongPress={onLongPress}
    style={({ pressed }) => [
      styles.timeRow,
      {
        borderColor: isHighlighted ? colors.primary : colors.bgLight,
        backgroundColor: pressed
          ? colors.primary + '20'
          : isHighlighted
            ? colors.primary + '10'
            : 'transparent',
      },
    ]}
  >
    <View style={styles.timeLabel}>
      <Icon
        name={getPrayerIcon(name)}
        type="feather"
        size={16}
        color={isHighlighted ? colors.primary : colors.text + '80'}
      />
      <Text style={[styles.timeName, isHighlighted && { color: colors.primary }]}>{name}</Text>
    </View>
    <Text style={[styles.timeValue, isHighlighted && { color: colors.primary }]}>{time}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  timeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  timeValue: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    opacity: 0.9,
  },
});

export default PrayerTimeRow;
