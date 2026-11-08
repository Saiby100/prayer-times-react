import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Icon, Overlay, Text, useTheme } from '@rneui/themed';
import type { ReminderType } from '@/stores';

type ReminderTypePopupProps = {
  /** Whether the popup is shown. */
  visible: boolean;
  /** The reminder type picked now. */
  currentType: ReminderType;
  /** Called with the type the user taps; the popup closes itself. */
  onSelect: (type: ReminderType) => void;
  /** Called when the user taps Test alarm; the popup closes itself. */
  onTestAlarm: () => void;
  /** Disables Test alarm (notifications blocked, so it couldn't ring). */
  testDisabled: boolean;
  /** Called when the popup is dismissed. */
  onClose: () => void;
};

type Option = {
  /** Reminder type the option picks. */
  type: ReminderType;
  /** Option name. */
  label: string;
  /** Icon name in `iconType`'s set. */
  icon: string;
  /** Icon set of `icon`. */
  iconType: 'feather' | 'ionicon';
  /** One-line explanation below the name. */
  description: string;
};

const OPTIONS: Option[] = [
  {
    type: 'notification',
    label: 'Notification',
    icon: 'bell',
    iconType: 'feather',
    description: 'A notification before each prayer',
  },
  {
    type: 'alarm',
    label: 'Alarm',
    icon: 'alarm-outline',
    iconType: 'ionicon',
    description: 'Rings like an alarm until you dismiss it',
  },
];

const ReminderTypePopup = ({
  visible,
  currentType,
  onSelect,
  onTestAlarm,
  testDisabled,
  onClose,
}: ReminderTypePopupProps) => {
  const { theme } = useTheme();

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      animationType="fade"
      overlayStyle={[styles.overlay, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Reminder type</Text>
        {OPTIONS.map((option) => {
          const isSelected = currentType === option.type;
          return (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.optionRow,
                {
                  backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.bgLight,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.sliderTrack,
                },
              ]}
              onPress={() => {
                onClose();
                onSelect(option.type);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Icon
                  name={option.icon}
                  type={option.iconType}
                  size={20}
                  color={isSelected ? theme.colors.primary : theme.colors.text + '80'}
                />
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, isSelected && { color: theme.colors.primary }]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </View>
              {isSelected && (
                <Icon name="check" type="feather" size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
        <Button
          title="Test alarm"
          type="outline"
          radius="md"
          disabled={testDisabled}
          onPress={() => {
            onClose();
            onTestAlarm();
          }}
          titleStyle={styles.buttonTitle}
          buttonStyle={styles.testButton}
          containerStyle={styles.testContainer}
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
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  optionDescription: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  testContainer: {
    marginTop: 4,
  },
  testButton: {
    borderWidth: 1,
  },
  buttonTitle: {
    fontSize: 13,
  },
});

export default ReminderTypePopup;
