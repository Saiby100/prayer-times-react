import { StyleSheet, TouchableOpacity } from 'react-native';
import { Icon, Text, useTheme } from '@rneui/themed';

type SettingsMenuRowProps = {
  /** Section name shown as the row label. */
  label: string;
  /** Feather icon name shown on the left. */
  iconName: string;
  /** Called when the row is pressed. */
  onPress: () => void;
};

export default function SettingsMenuRow({ label, iconName, onPress }: SettingsMenuRowProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <Icon name={iconName} type="feather" size={20} color={theme.colors.text} />
      <Text style={styles.label}>{label}</Text>
      <Icon name="chevron-right" type="feather" size={22} color={theme.colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
});
