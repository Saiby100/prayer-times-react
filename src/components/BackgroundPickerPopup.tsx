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
import { backgroundOptions, type BackgroundOption } from '@/theme/backgrounds';

type BackgroundPickerPopupProps = {
  /** Whether the picker popup is shown. */
  visible: boolean;
  /** Called to close the popup. */
  onClose: () => void;
  /** ID of the currently selected background. */
  selectedId: string;
  /** Called when a background option is selected. */
  onSelect: (id: string) => void;
};

export default function BackgroundPickerPopup({
  visible,
  onClose,
  selectedId,
  onSelect,
}: BackgroundPickerPopupProps) {
  const { theme } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const overlayWidth = screenWidth * 0.85;
  const contentWidth = overlayWidth - 48;
  // Cap preview height so the overlay fits on screen (title + dots + padding ~ 100px)
  const maxPreviewHeight = screenHeight * 0.6;
  const naturalHeight = contentWidth * (3 / 2); // images are 2:3 ratio
  const previewHeight = Math.min(naturalHeight, maxPreviewHeight);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / contentWidth);
      setActiveIndex(index);
    },
    [contentWidth]
  );

  const handleOpen = useCallback(() => {
    const index = backgroundOptions.findIndex((opt) => opt.id === selectedId);
    const startIndex = index >= 0 ? index : 0;
    setActiveIndex(startIndex);
    flatListRef.current?.scrollToOffset({ offset: startIndex * contentWidth, animated: false });
  }, [selectedId, contentWidth]);

  const handleSelect = (id: string) => {
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
        <Text style={styles.title}>Choose Background</Text>
        <FlatList
          ref={flatListRef}
          data={backgroundOptions}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ width: contentWidth }}>
              <OptionCard
                option={item}
                isSelected={item.id === selectedId}
                onSelect={handleSelect}
                previewHeight={previewHeight}
                themeBackground={theme.colors.background}
                primaryColor={theme.colors.primary}
                sliderTrackColor={theme.colors.sliderTrack}
              />
            </View>
          )}
        />
        <View style={styles.dots}>
          {backgroundOptions.map((_, i) => (
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

type OptionCardProps = {
  /** Background option data. */
  option: BackgroundOption;
  /** Whether this option is currently active. */
  isSelected: boolean;
  /** Called when this option is chosen. */
  onSelect: (id: string) => void;
  /** Height of the image preview area. */
  previewHeight: number;
  /** Theme background color for the 'none' preview. */
  themeBackground: string;
  /** Theme primary color for the selection indicator. */
  primaryColor: string;
  /** Theme slider track color for the border. */
  sliderTrackColor: string;
};

function OptionCard({
  option,
  isSelected,
  onSelect,
  previewHeight,
  themeBackground,
  primaryColor,
  sliderTrackColor,
}: OptionCardProps) {
  return (
    <TouchableOpacity onPress={() => onSelect(option.id)} activeOpacity={0.7}>
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
        {option.source ? (
          <Image
            source={option.source}
            style={[styles.preview, { height: previewHeight }]}
            resizeMode="contain"
          />
        ) : (
          <View
            style={[styles.preview, { height: previewHeight, backgroundColor: themeBackground }]}
          />
        )}
      </View>
      <Text style={styles.label}>{option.label}</Text>
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
