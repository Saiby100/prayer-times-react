import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text, useTheme } from '@rneui/themed';

type BannerProps = {
  icon?: { name: string; type?: string };
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
};

export default function Banner({ icon, message, actionLabel, onAction, onDismiss }: BannerProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bgLight }]}>
      {icon && (
        <Icon
          name={icon.name}
          type={icon.type ?? 'feather'}
          size={18}
          color={theme.colors.primary}
        />
      )}
      <Text style={styles.text}>{message}</Text>
      {actionLabel && onAction && (
        <Button
          type="clear"
          title={actionLabel}
          titleStyle={[styles.actionTitle, { color: theme.colors.primary }]}
          buttonStyle={styles.actionButton}
          onPress={onAction}
        />
      )}
      {onDismiss && (
        <Button
          type="clear"
          icon={{ name: 'x', type: 'feather', size: 16, color: theme.colors.text }}
          buttonStyle={styles.dismissButton}
          onPress={onDismiss}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  dismissButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
