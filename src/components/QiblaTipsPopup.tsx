import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Overlay, Text, useTheme } from '@rneui/themed';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const TIPS = [
  {
    icon: 'mobile-screen',
    text: 'Lay your phone flat and level for an accurate reading.',
  },
  {
    icon: 'magnet',
    text: 'Keep away from metal objects, magnets, and electronics.',
  },
  {
    icon: 'kaaba',
    text: "You're facing the Qibla when the Kaaba lines up with the top marker.",
  },
] as const;

type QiblaTipsPopupProps = {
  /** Whether the popup is shown. */
  visible: boolean;
  /** Called to close the popup. */
  onClose: () => void;
};

const QiblaTipsPopup = ({ visible, onClose }: QiblaTipsPopupProps) => {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      animationType="fade"
      overlayStyle={[
        styles.overlay,
        { width: screenWidth * 0.85, backgroundColor: theme.colors.background },
      ]}
    >
      <View>
        <Text style={styles.title}>Finding the Qibla</Text>
        <View style={styles.list}>
          {TIPS.map(({ icon, text }) => (
            <View key={icon} style={styles.row}>
              <FontAwesome6
                name={icon}
                size={16}
                color={theme.colors.secondary}
                style={styles.icon}
              />
              <Text style={[styles.tipText, { color: theme.colors.text + '99' }]}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
    </Overlay>
  );
};

export default QiblaTipsPopup;

const styles = StyleSheet.create({
  overlay: {
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  list: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 20,
    textAlign: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    lineHeight: 20,
  },
});
