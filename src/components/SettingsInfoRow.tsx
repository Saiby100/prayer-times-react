import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';

type SettingsInfoRowProps = {
  label: string;
  value: string;
  selectable?: boolean;
};

export default function SettingsInfoRow({ label, value, selectable }: SettingsInfoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text selectable={selectable} style={styles.value}>
        {value}
      </Text>
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
  value: {
    fontSize: 14,
    opacity: 0.6,
  },
});
