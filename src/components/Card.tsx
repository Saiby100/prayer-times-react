import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text, useTheme } from '@rneui/themed';

type CardProps = {
  /** Optional heading displayed above the card content. */
  title?: string;
  /** Additional styles applied to the card container. */
  style?: StyleProp<ViewStyle>;
  /** Card content. */
  children: ReactNode;
};

export default function Card({ title, style, children }: CardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.bgLight }, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
});
