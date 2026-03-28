import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@rneui/themed';

type ScrimProps = {
  /** Content rendered inside the scrim overlay. */
  children: React.ReactNode;
  /** Additional styles applied to the scrim container. */
  style?: StyleProp<ViewStyle>;
};

const OPACITY_HEX = 'BF'; // ~75% opacity

const Scrim = ({ children, style }: ScrimProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.scrim, { backgroundColor: theme.colors.background + OPACITY_HEX }, style]}>
      {children}
    </View>
  );
};

export default Scrim;

const styles = StyleSheet.create({
  scrim: {
    borderRadius: 16,
    marginHorizontal: 8,
    marginVertical: 8,
    paddingVertical: 16,
  },
});
