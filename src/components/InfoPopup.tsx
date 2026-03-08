import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  useWindowDimensions,
} from 'react-native';
import { Overlay, Text, useTheme } from '@rneui/themed';

type InfoItem = {
  title: string;
  description: string;
};

type InfoPopupProps = {
  visible: boolean;
  onClose: () => void;
  items: InfoItem[];
};

export default function InfoPopup({ visible, onClose, items }: InfoPopupProps) {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const overlayWidth = screenWidth * 0.85;
  const contentWidth = overlayWidth - 48;

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / contentWidth);
      setActiveIndex(index);
    },
    [contentWidth]
  );

  const handleOpen = useCallback(() => {
    setActiveIndex(0);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  if (items.length === 0) return null;

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
        {items.length === 1 ? (
          <InfoPage item={items[0]} />
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={items}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEnd}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <View style={{ width: contentWidth }}>
                  <InfoPage item={item} />
                </View>
              )}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
                marginTop: 16,
              }}
            >
              {items.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      i === activeIndex ? theme.colors.primary : theme.colors.sliderTrack,
                  }}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </Overlay>
  );
}

function InfoPage({ item }: { item: InfoItem }) {
  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>{item.title}</Text>
      <Text style={{ fontSize: 14, lineHeight: 22, opacity: 0.8 }}>{item.description}</Text>
    </View>
  );
}
