import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Overlay, Text, useTheme } from '@rneui/themed';
import { themePresets, type ThemePreset, type ThemePresetId } from '@/theme/presets';

type ThemePickerPopupProps = {
  /** Whether the picker popup is shown. */
  visible: boolean;
  /** Called to close the popup. */
  onClose: () => void;
  /** ID of the currently selected theme preset. */
  selectedId: ThemePresetId;
  /** Called when a theme preset is selected. */
  onSelect: (id: ThemePresetId) => void;
};

export default function ThemePickerPopup({
  visible,
  onClose,
  selectedId,
  onSelect,
}: ThemePickerPopupProps) {
  const { theme } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const overlayWidth = screenWidth * 0.85;
  const contentWidth = overlayWidth - 48;
  const maxPreviewHeight = screenHeight * 0.6;
  const naturalHeight = contentWidth * (3 / 2);
  const previewHeight = Math.min(naturalHeight, maxPreviewHeight);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / contentWidth);
      setActiveIndex(index);
    },
    [contentWidth]
  );

  const handleOpen = useCallback(() => {
    const index = themePresets.findIndex((preset) => preset.id === selectedId);
    const startIndex = index >= 0 ? index : 0;
    setActiveIndex(startIndex);
    flatListRef.current?.scrollToOffset({ offset: startIndex * contentWidth, animated: false });
  }, [selectedId, contentWidth]);

  const handleSelect = (id: ThemePresetId) => {
    onSelect(id);
    onClose();
  };

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      onShow={handleOpen}
      animationType="fade"
      overlayStyle={{
        borderRadius: 12,
        padding: 24,
        width: overlayWidth,
        backgroundColor: theme.colors.background,
      }}
    >
      <View>
        <Text style={styles.title}>Choose Theme</Text>
        <FlatList
          ref={flatListRef}
          data={themePresets}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width: contentWidth }}>
              <PresetCard
                preset={item}
                isSelected={item.id === selectedId}
                onSelect={handleSelect}
                previewHeight={previewHeight}
                primaryColor={theme.colors.primary}
                sliderTrackColor={theme.colors.sliderTrack}
              />
            </View>
          )}
        />
        <View style={styles.dots}>
          {themePresets.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeIndex ? theme.colors.primary : theme.colors.sliderTrack,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </Overlay>
  );
}

type PresetCardProps = {
  /** Theme preset data. */
  preset: ThemePreset;
  /** Whether this preset is currently active. */
  isSelected: boolean;
  /** Called when this preset is chosen. */
  onSelect: (id: ThemePresetId) => void;
  /** Height of the image preview area. */
  previewHeight: number;
  /** Theme primary color for the selection indicator. */
  primaryColor: string;
  /** Theme slider track color for the border. */
  sliderTrackColor: string;
};

function PresetCard({
  preset,
  isSelected,
  onSelect,
  previewHeight,
  primaryColor,
  sliderTrackColor,
}: PresetCardProps) {
  return (
    <TouchableOpacity onPress={() => onSelect(preset.id)} activeOpacity={0.7}>
      <View
        style={[
          styles.card,
          {
            height: previewHeight,
            borderColor: isSelected ? primaryColor : sliderTrackColor,
            borderWidth: isSelected ? 2.5 : 1,
          },
        ]}
      >
        <Image
          source={preset.previewSource}
          style={[styles.preview, { height: previewHeight }]}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.label}>{preset.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
