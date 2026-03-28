import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@rneui/themed';
import type { SurahMeta } from '@/types/quran';

type SurahRowColors = {
  primary: string;
  text: string;
  sliderTrack: string;
};

type SurahRowProps = {
  surah: SurahMeta;
  colors: SurahRowColors;
  onPress: () => void;
};

const SurahRow = memo(function SurahRow({ surah, colors, onPress }: SurahRowProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
        <Text style={[styles.badgeText, { color: colors.primary }]}>{surah.number}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.englishName, { color: colors.text }]}>{surah.englishName}</Text>
        <Text style={[styles.meta, { color: colors.text, opacity: 0.5 }]}>
          {surah.revelationType} · {surah.numberOfAyahs} ayahs
        </Text>
      </View>
      <Text style={[styles.arabicName, { color: colors.text }]}>{surah.name}</Text>
    </TouchableOpacity>
  );
});

export default SurahRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  englishName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  meta: {
    fontSize: 12,
  },
  arabicName: {
    fontSize: 22,
    writingDirection: 'rtl',
  },
});
