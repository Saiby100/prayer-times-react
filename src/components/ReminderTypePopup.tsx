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
  /** Called when the user taps Preview reminder; the popup closes itself. */
  onPreview: () => void;
  /** Disables Preview reminder (notifications blocked, so nothing would show). */
  previewDisabled: boolean;
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
  onPreview,
  previewDisabled,
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
            </TouchableOpacity>
          );
        })}
        <Button
          title="Preview reminder"
          type="outline"
          radius="md"
          disabled={previewDisabled}
          onPress={() => {
            onClose();
            onPreview();
          }}
          titleStyle={styles.buttonTitle}
          buttonStyle={styles.previewButton}
          containerStyle={styles.previewContainer}
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
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Inter-Medium',
  },
  optionDescription: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  previewContainer: {
    marginTop: 4,
  },
  previewButton: {
    borderWidth: 1,
  },
  buttonTitle: {
    fontSize: 13,
  },
});

export default ReminderTypePopup;
