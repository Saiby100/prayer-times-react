import { View } from 'react-native';
import { Button, Overlay, Text, useTheme } from '@rneui/themed';

type ConfirmPopupProps = {
  /** Whether the popup is shown. */
  visible: boolean;
  /** Popup heading text. */
  title: string;
  /** Body text describing the action. */
  message: string;
  /** Label for the confirm button. */
  confirmLabel: string;
  /** Label for the dismiss button. */
  dismissLabel: string;
  /** Called when the user confirms. */
  onConfirm: () => void;
  /** Called when the user dismisses. */
  onDismiss: () => void;
};

export default function ConfirmPopup({
  visible,
  title,
  message,
  confirmLabel,
  dismissLabel,
  onConfirm,
  onDismiss,
}: ConfirmPopupProps) {
  const { theme } = useTheme();

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onDismiss}
      animationType="fade"
      overlayStyle={{
        borderRadius: 12,
        padding: 24,
        width: '80%',
        backgroundColor: theme.colors.background,
      }}
    >
      <View>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>{title}</Text>
        <Text style={{ fontSize: 14, opacity: 0.8, marginBottom: 24 }}>{message}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            title={dismissLabel}
            onPress={onDismiss}
            type="outline"
            radius="md"
            titleStyle={{ fontSize: 13 }}
            containerStyle={{ flex: 1 }}
          />
          <Button
            title={confirmLabel}
            onPress={onConfirm}
            radius="md"
            titleStyle={{ fontSize: 13 }}
            containerStyle={{ flex: 1 }}
          />
        </View>
      </View>
    </Overlay>
  );
}
