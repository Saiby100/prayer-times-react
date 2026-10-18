import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from '@rneui/themed';

type ErrorMessageProps = {
  /** Text explaining what went wrong. */
  message: string;
  /** Title of the action button. */
  buttonTitle: string;
  /** Called when the action button is pressed. */
  onPress: () => void;
};

const ErrorMessage = ({ message, buttonTitle, onPress }: ErrorMessageProps) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: theme.colors.text }]}>{message}</Text>
      <Button
        title={buttonTitle}
        onPress={onPress}
        buttonStyle={{ backgroundColor: theme.colors.primary, borderRadius: 8 }}
        titleStyle={{ fontFamily: 'Inter-Medium', color: theme.colors.background }}
        containerStyle={styles.button}
      />
    </View>
  );
};

export default ErrorMessage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 20,
    minWidth: 180,
  },
});
