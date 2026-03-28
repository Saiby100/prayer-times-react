import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, useTheme } from '@rneui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Page from '@/components/Page';
import LoadingList from '@/components/LoadingList';
import SurahReaderView from '@/components/quran/SurahReaderView';
import BookmarkListModal from '@/components/quran/BookmarkListModal';
import useQuran from '@/hooks/useQuran';
import type { Ayah } from '@/types/quran';

export default function SurahReader() {
  const { surahNumber, initialAyah } = useLocalSearchParams<{
    surahNumber: string;
    initialAyah?: string;
  }>();
  const { theme } = useTheme();
  const router = useRouter();
  const {
    surahList,
    currentSurah,
    surahLoading,
    surahError,
    fetchSurah,
    bookmarks,
    toggleBookmark,
    saveLastRead,
  } = useQuran();

  const [bookmarksVisible, setBookmarksVisible] = useState(false);
  const lastViewedAyah = useRef<number>(1);
  const surahNum = Number(surahNumber);

  useEffect(() => {
    fetchSurah(surahNum);
  }, [surahNum, fetchSurah]);

  // Save last read when leaving the screen
  useEffect(() => {
    const ayahRef = lastViewedAyah;
    return () => {
      if (currentSurah) {
        saveLastRead({
          surahNumber: currentSurah.number,
          ayahNumber: ayahRef.current,
          surahName: currentSurah.englishName,
        });
      }
    };
  }, [currentSurah, saveLastRead]);

  const handleToggleBookmark = useCallback(
    (ayah: Ayah) => {
      if (!currentSurah) return;
      toggleBookmark({
        surahNumber: currentSurah.number,
        surahName: currentSurah.englishName,
        ayahNumber: ayah.number,
        numberInQuran: ayah.numberInQuran,
      });
    },
    [currentSurah, toggleBookmark]
  );

  const handleNavigate = useCallback(
    (targetSurah: number) => {
      router.replace({
        pathname: '/(tabs)/quran/[surahNumber]',
        params: { surahNumber: String(targetSurah) },
      });
    },
    [router]
  );

  const colors = {
    primary: theme.colors.primary,
    text: theme.colors.text,
    bgLight: theme.colors.bgLight,
    sliderTrack: theme.colors.sliderTrack,
  };

  const scrollIndex = initialAyah ? Number(initialAyah) - 1 : undefined;

  return (
    <Page
      name="[surahNumber]"
      title={currentSurah?.englishName ?? 'Loading...'}
      error={surahError}
      onRetry={() => fetchSurah(surahNum)}
      options={{
        headerRight: () => (
          <View style={{ marginRight: 8 }}>
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
      {surahLoading ? (
        <LoadingList />
      ) : currentSurah ? (
        <SurahReaderView
          surah={currentSurah}
          surahList={surahList}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
          onNavigate={handleNavigate}
          initialScrollIndex={scrollIndex}
          colors={colors}
        />
      ) : null}
      <BookmarkListModal
        visible={bookmarksVisible}
        onClose={() => setBookmarksVisible(false)}
        bookmarks={bookmarks}
        onSelect={(b) => {
          setBookmarksVisible(false);
          if (b.surahNumber === surahNum) {
            // Same surah — just scroll (would need ref, for now re-navigate)
            router.replace({
              pathname: '/(tabs)/quran/[surahNumber]',
              params: { surahNumber: String(b.surahNumber), initialAyah: String(b.ayahNumber) },
            });
          } else {
            handleNavigate(b.surahNumber);
          }
        }}
      />
    </Page>
  );
}
