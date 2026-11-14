import { StyleSheet, View } from 'react-native';
import { Button, Text } from '@rneui/themed';

type SettingsToggleRowProps = {
  /** Descriptive text shown below the title. */
  label: string;
  /** Heading text for the row. */
  title: string;
  /** Called when the toggle button is pressed. */
  onPress: () => void;
  /** Show a loading indicator instead of the button. */
  loading?: boolean;
  /** Disable the toggle button. */
  disabled?: boolean;
};

export default function SettingsToggleRow({
  label,
  title,
  onPress,
  loading,
  disabled,
}: SettingsToggleRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Button
        type="outline"
        size="sm"
        radius="md"
        title={title}
        titleStyle={styles.title}
        buttonStyle={styles.button}
        loading={loading}
        disabled={disabled}
        onPress={onPress}
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
  title: {
    fontSize: 14,
  },
  button: {
    borderWidth: 1,
    paddingHorizontal: 12,
  },
});
