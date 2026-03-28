import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button, useTheme } from '@rneui/themed';
import { useRouter } from 'expo-router';
import Page from '@/components/Page';
import SurahListView from '@/components/quran/SurahListView';
import BookmarkListModal from '@/components/quran/BookmarkListModal';
import useQuran from '@/hooks/useQuran';
import { JUZ_TO_SURAHS } from '@/utils/quranData';
import type { SurahMeta } from '@/types/quran';

export default function QuranSurahList() {
  const { theme } = useTheme();
  const router = useRouter();
  const { surahList, listLoading, listError, fetchSurahList, bookmarks, lastRead } = useQuran();

  const [bookmarksVisible, setBookmarksVisible] = useState(false);

  const colors = {
    primary: theme.colors.primary,
    text: theme.colors.text,
    sliderTrack: theme.colors.sliderTrack,
    background: theme.colors.background,
  };

  const sections = useMemo(() => {
    if (surahList.length === 0) return [];
    const surahMap = new Map(surahList.map((s) => [s.number, s]));
    return Object.entries(JUZ_TO_SURAHS)
      .map(([juz, surahNumbers]) => ({
        juzNumber: Number(juz),
        data: surahNumbers
          .map((n) => surahMap.get(n))
          .filter((s): s is SurahMeta => s !== undefined),
      }))
      .filter((section) => section.data.length > 0);
  }, [surahList]);

  const navigateToSurah = (surahNumber: number, initialAyah?: number) => {
    const params: Record<string, string> = { surahNumber: String(surahNumber) };
    if (initialAyah) params.initialAyah = String(initialAyah);
    router.push({ pathname: '/(tabs)/quran/[surahNumber]', params });
  };

  return (
    <Page
      name="index"
      title="Al-Quran"
      options={{
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 8, marginRight: 8 }}>
            {lastRead && (
              <Button
                type="clear"
                size="sm"
                icon={{
                  name: 'play-circle',
                  type: 'feather',
                  size: 20,
                  color: theme.colors.primary,
                }}
                onPress={() => navigateToSurah(lastRead.surahNumber, lastRead.ayahNumber)}
              />
            )}
            <Button
              type="clear"
              size="sm"
              icon={{ name: 'bookmark', type: 'feather', size: 20, color: theme.colors.primary }}
              onPress={() => setBookmarksVisible(true)}
            />
          </View>
        ),
      }}
    >
      <SurahListView
        sections={sections}
        loading={listLoading}
        error={listError}
        onRetry={fetchSurahList}
        onSelectSurah={(n) => navigateToSurah(n)}
        colors={colors}
      />
      <BookmarkListModal
        visible={bookmarksVisible}
        onClose={() => setBookmarksVisible(false)}
        bookmarks={bookmarks}
        onSelect={(b) => {
          setBookmarksVisible(false);
          navigateToSurah(b.surahNumber, b.ayahNumber);
        }}
      />
    </Page>
  );
}
