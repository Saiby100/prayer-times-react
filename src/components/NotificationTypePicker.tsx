import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Overlay, Text, useTheme } from '@rneui/themed';

type NotificationType = 'notification' | 'alarm';

type NotificationTypePickerProps = {
  /** Whether the popup is shown. */
  visible: boolean;
  /** Currently selected notification type. */
  currentType: NotificationType;
  /** Called when the user selects a type. */
  onSelect: (type: NotificationType) => void;
  /** Called when the popup is dismissed. */
  onClose: () => void;
};

const OPTIONS: { type: NotificationType; label: string; icon: string; description: string }[] = [
  {
    type: 'notification',
    label: 'Notification',
    icon: 'bell',
    description: 'Standard push notification',
  },
  {
    type: 'alarm',
    label: 'Alarm',
    icon: 'alert-circle',
    description: 'High-priority persistent notification',
  },
];

const NotificationTypePicker = ({
  visible,
  currentType,
  onSelect,
  onClose,
}: NotificationTypePickerProps) => {
  const { theme } = useTheme();

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      animationType="fade"
      overlayStyle={[styles.overlay, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Notification Type</Text>
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
                onSelect(option.type);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Icon
                  name={option.icon}
                  type="feather"
                  size={20}
                  color={isSelected ? theme.colors.primary : theme.colors.text + '80'}
                />
                <View>
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
    textAlign: 'center',
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
  optionLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  optionDescription: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
});

export default NotificationTypePicker;
