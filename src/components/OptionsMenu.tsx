import { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Button, Text, Overlay, useTheme } from '@rneui/themed';
import { Icon } from '@rneui/themed';

type OptionsMenuItem = {
  /** Display text for the menu item. */
  label: string;
  /** Icon name (Feather icon set). */
  icon: string;
  /** Called when the menu item is pressed. */
  onPress: () => void;
};

type OptionsMenuProps = {
  /** List of menu items to render. */
  items: OptionsMenuItem[];
};

export default function OptionsMenu({ items }: OptionsMenuProps) {
  const [visible, setVisible] = useState(false);
  const { theme } = useTheme();

  const handleItemPress = (onPress: () => void) => {
    setVisible(false);
    onPress();
  };

  return (
    <View>
      <Button
        icon={{ name: 'more-vertical', type: 'feather' }}
        onPressIn={() => setVisible(true)}
      />
      <Overlay
        isVisible={visible}
        onBackdropPress={() => setVisible(false)}
        animationType="fade"
        overlayStyle={[styles.overlay, { backgroundColor: theme.colors.background }]}
      >
        <View>
          {items.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => handleItemPress(item.onPress)}
            >
              <Icon name={item.icon} type="feather" size={18} color={theme.colors.text} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Overlay>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 60,
    right: 16,
    borderRadius: 8,
    padding: 4,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuLabel: {
    fontSize: 16,
  },
});
