import { useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import AyahCard from '@/components/quran/AyahCard';
import SurahNavFooter from '@/components/quran/SurahNavFooter';
import type { Ayah, Bookmark, Surah, SurahMeta } from '@/types/quran';

type ReaderColors = {
  primary: string;
  text: string;
  bgLight: string;
  sliderTrack: string;
};

type SurahReaderViewProps = {
  surah: Surah;
  surahList: SurahMeta[];
  bookmarks: Bookmark[];
  onToggleBookmark: (ayah: Ayah) => void;
  onNavigate: (surahNumber: number) => void;
  initialScrollIndex?: number;
  colors: ReaderColors;
};

const SurahReaderView = ({
  surah,
  surahList,
  bookmarks,
  onToggleBookmark,
  onNavigate,
  initialScrollIndex,
  colors,
}: SurahReaderViewProps) => {
  const listRef = useRef<FlatList<Ayah>>(null);

  const isBookmarked = (ayah: Ayah) =>
    bookmarks.some((b) => b.surahNumber === surah.number && b.ayahNumber === ayah.number);

  return (
    <FlatList
      ref={listRef}
      data={surah.ayahs}
      keyExtractor={(item) => item.numberInQuran.toString()}
      renderItem={({ item }) => (
        <AyahCard
          ayah={item}
          isBookmarked={isBookmarked(item)}
          onToggleBookmark={() => onToggleBookmark(item)}
          colors={colors}
        />
      )}
      ListFooterComponent={
        <SurahNavFooter surahNumber={surah.number} surahList={surahList} onNavigate={onNavigate} />
      }
      contentContainerStyle={styles.list}
      initialScrollIndex={initialScrollIndex}
      getItemLayout={(_data, index) => ({
        length: ESTIMATED_ITEM_HEIGHT,
        offset: ESTIMATED_ITEM_HEIGHT * index,
        index,
      })}
      initialNumToRender={10}
      maxToRenderPerBatch={15}
      windowSize={7}
    />
  );
};

export default SurahReaderView;

const ESTIMATED_ITEM_HEIGHT = 200;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 10,
  },
});
