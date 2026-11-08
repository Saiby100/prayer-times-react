import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from '@rneui/themed';
import Card from '@/components/Card';

type FullScreenAlarmWarningProps = {
  /** Called when the user taps Fix; opens Android's full-screen setting. */
  onFix: () => void;
};

/** Shown while Alarm is picked but alarms can't show their ringing screen on the lock screen. */
const FullScreenAlarmWarning = ({ onFix }: FullScreenAlarmWarningProps) => {
  const { theme } = useTheme();

  return (
    <Card>
      <View style={styles.row}>
        <Icon name="alert-triangle" type="feather" size={20} color={theme.colors.warning} />
        <View style={styles.text}>
          <Text style={[styles.title, { color: theme.colors.warning }]}>
            Allow full-screen alarms
          </Text>
          <Text style={styles.message}>
            Without it, alarms ring but don&apos;t show on the lock screen.
          </Text>
        </View>
        <Button title="Fix" size="sm" radius="md" onPress={onFix} titleStyle={styles.buttonTitle} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  message: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  buttonTitle: {
    fontSize: 13,
  },
});

export default FullScreenAlarmWarning;
