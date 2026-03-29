import { StyleSheet, View } from 'react-native';
import { Overlay, Text, useTheme } from '@rneui/themed';
import SettingsToggleRow from '@/components/SettingsToggleRow';

type PrayerReminderPopupProps = {
  /** Whether the popup is shown. */
  visible: boolean;
  /** Name of the prayer being configured. */
  prayerName: string;
  /** Whether notifications are currently enabled for this prayer. */
  isEnabled: boolean;
  /** Called when the user toggles the notification state. */
  onToggle: () => void;
  /** Called when the popup is dismissed. */
  onClose: () => void;
};

const PrayerReminderPopup = ({
  visible,
  prayerName,
  isEnabled,
  onToggle,
  onClose,
}: PrayerReminderPopupProps) => {
  const { theme } = useTheme();

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      animationType="fade"
      overlayStyle={[styles.overlay, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{prayerName} Settings</Text>
        <SettingsToggleRow
          label="Notifications"
          iconName={isEnabled ? 'bell' : 'bell-off'}
          title={isEnabled ? ' On' : ' Off'}
          onPress={onToggle}
        />
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  content: {
    gap: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
  },
});

export default PrayerReminderPopup;
