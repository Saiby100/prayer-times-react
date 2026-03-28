import { View, StyleSheet } from 'react-native';
import { Button, Icon, Text, useTheme } from '@rneui/themed';

type NetworkErrorProps = {
  /** Whether an error is present. */
  error: boolean;
  /** Called when the retry button is pressed. */
  onRetry: () => void;
  /** Custom error message to display. */
  message?: string;
};

const NetworkError: React.FC<NetworkErrorProps> = ({
  error,
  onRetry,
  message = 'Unable to load data. Check your connection and try again.',
}) => {
  const { theme } = useTheme();

  if (!error) return null;

  return (
    <View style={styles.container}>
      <Icon name="wifi-off" type="feather" size={48} color={theme.colors.grey3} />
      <Text style={[styles.message, { color: theme.colors.grey3 }]}>{message}</Text>
      <Button
        type="outline"
        radius="md"
        onPress={onRetry}
        icon={{ name: 'refresh-cw', type: 'feather', size: 16 }}
        title="Retry"
        buttonStyle={{ paddingHorizontal: 24 }}
      />
    </View>
  );
};

export default NetworkError;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  message: {
    textAlign: 'center',
    fontSize: 14,
  },
});
