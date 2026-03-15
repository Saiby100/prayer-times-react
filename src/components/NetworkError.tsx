import { View, StyleSheet } from 'react-native';
import { Button, Icon, Text, useTheme } from '@rneui/themed';

type NetworkErrorProps = {
  onRetry: () => void;
  message?: string;
};

const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message = 'Unable to load data. Check your connection and try again.',
}) => {
  const { theme } = useTheme();

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  message: {
    textAlign: 'center',
    fontSize: 14,
  },
});
