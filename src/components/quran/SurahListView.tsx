import { SectionList, SectionListData, StyleSheet } from 'react-native';
import LoadingList from '@/components/LoadingList';
import NetworkError from '@/components/NetworkError';
import JuzSectionHeader from '@/components/quran/JuzSectionHeader';
import SurahRow from '@/components/quran/SurahRow';
import type { SurahMeta } from '@/types/quran';

type SurahListColors = {
  primary: string;
  text: string;
  sliderTrack: string;
  background: string;
};

type SurahListViewProps = {
  sections: SectionListData<SurahMeta, { juzNumber: number }>[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onSelectSurah: (surahNumber: number) => void;
  colors: SurahListColors;
};

const SurahListView = ({
  sections,
  loading,
  error,
  onRetry,
  onSelectSurah,
  colors,
}: SurahListViewProps) => {
  if (loading) return <LoadingList />;
  if (error) return <NetworkError error={error} onRetry={onRetry} />;

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.number.toString()}
      stickySectionHeadersEnabled
      renderSectionHeader={({ section }) => (
        <JuzSectionHeader juzNumber={section.juzNumber} colors={colors} />
      )}
      renderItem={({ item }) => (
        <SurahRow surah={item} colors={colors} onPress={() => onSelectSurah(item.number)} />
      )}
      contentContainerStyle={styles.list}
      initialNumToRender={15}
      maxToRenderPerBatch={20}
      windowSize={7}
    />
  );
};

export default SurahListView;

const styles = StyleSheet.create({
  list: {
    paddingBottom: 24,
  },
});
