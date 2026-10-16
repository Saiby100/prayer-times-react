import { StyleSheet, View } from 'react-native';
import { Switch, Text, useTheme } from '@rneui/themed';

type SettingsSwitchRowProps = {
  /** Text shown on the left of the row. */
  label: string;
  /** Whether the setting is on. */
  value: boolean;
  /** Called with the new value when the switch is toggled. */
  onValueChange: (value: boolean) => void;
};

export default function SettingsSwitchRow({ label, value, onValueChange }: SettingsSwitchRowProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        // RNEUI paints thumb and track both in primary, hiding the thumb when on
        thumbColor={value ? theme.colors.primary : theme.colors.text}
        trackColor={{ true: `${theme.colors.primary}80`, false: theme.colors.sliderTrack }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
  },
});
