import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, Overlay, Text, useTheme } from '@rneui/themed';

type ReminderOffsetPopupProps = {
  /** Whether the popup is shown. */
  visible: boolean;
  /** Current reminder offset in minutes. */
  currentValue: number;
  /** Called with the new offset when the user saves. */
  onSave: (minutes: number) => void;
  /** Called when the popup is dismissed. */
  onClose: () => void;
};

const PRESETS = [5, 10, 15, 20, 30];

const ReminderOffsetPopup = ({
  visible,
  currentValue,
  onSave,
  onClose,
}: ReminderOffsetPopupProps) => {
  const { theme } = useTheme();
  const [value, setValue] = useState(String(currentValue));

  const handleSave = () => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return;
    const clamped = Math.max(0, Math.min(60, parsed));
    onSave(clamped);
    onClose();
  };

  const selectPreset = (preset: number) => {
    setValue(String(preset));
  };

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      animationType="fade"
      overlayStyle={[styles.overlay, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Reminder Time</Text>
        <Text style={styles.subtitle}>Minutes before prayer time</Text>

        <View style={styles.presets}>
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              title={String(preset)}
              onPress={() => selectPreset(preset)}
              type={value === String(preset) ? 'solid' : 'outline'}
              radius="md"
              size="sm"
              buttonStyle={styles.presetButton}
              titleStyle={styles.presetTitle}
            />
          ))}
        </View>

        <TextInput
          value={value}
          onChangeText={setValue}
          keyboardType="number-pad"
          maxLength={2}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.bgLight,
              color: theme.colors.text,
              borderColor: theme.colors.sliderTrack,
            },
          ]}
          placeholder="Min"
          placeholderTextColor={theme.colors.text + '40'}
        />

        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={onClose}
            type="outline"
            radius="md"
            titleStyle={styles.buttonTitle}
          />
          <Button title="Save" onPress={handleSave} radius="md" titleStyle={styles.buttonTitle} />
        </View>
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
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  presets: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  presetButton: {
    borderWidth: 1,
    minWidth: 44,
  },
  presetTitle: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    width: 80,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  buttonTitle: {
    fontSize: 13,
  },
});

export default ReminderOffsetPopup;
