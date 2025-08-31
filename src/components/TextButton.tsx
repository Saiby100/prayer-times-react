import React from 'react';
import { Text, ViewStyle, Pressable, StyleSheet, TextStyle } from 'react-native';

interface ButtonProps {
  title: string; // Required
  onPress: () => void; // Required
  style?: ViewStyle;
  textStyle?: TextStyle;
  // pressStyle?: ViewStyle;
  disabled?: boolean;
}

const TextButton: React.FC<ButtonProps>  = ({ title, onPress, style, textStyle, disabled, }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={!!disabled}
      style={({pressed}) => [
        styles.default,
        pressed && styles.pressed,
        styles.shadow, //light mode only
        style
      ]}
      >
        <Text
          style={textStyle}
        >{ title }</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  default: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shadow: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  },
  pressed: {
    opacity: 0.7
  }
});

export default TextButton;
