import { memo } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import type { Ayah } from '@/types/quran';

type AyahCardColors = {
  primary: string;
  text: string;
  bgLight: string;
  sliderTrack: string;
};

type AyahCardProps = {
  ayah: Ayah;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  colors: AyahCardColors;
};

const AyahCard = memo(function AyahCard({
  ayah,
  isBookmarked,
  onToggleBookmark,
  colors,
}: AyahCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: colors.bgLight }]}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{ayah.number}</Text>
        </View>
        <TouchableOpacity onPress={onToggleBookmark} hitSlop={8}>
          <Icon
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            type="material-community"
            size={22}
            color={isBookmarked ? colors.primary : colors.sliderTrack}
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.arabic, { color: colors.text }]}>{ayah.arabic}</Text>
      <Text style={[styles.translation, { color: colors.text }]}>{ayah.translation}</Text>
    </View>
  );
});

export default AyahCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  arabic: {
    fontSize: 26,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 48,
    fontFamily: Platform.OS === 'android' ? 'serif' : undefined,
  },
  translation: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    opacity: 0.7,
  },
});
