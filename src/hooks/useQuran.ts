import { useCallback, useEffect, useRef, useState } from 'react';
import getStorage from '@/utils/localStore';
import QuranApi from '@/utils/QuranApi';
import type { SurahMeta, Surah, Bookmark, LastRead } from '@/types/quran';

const storage = getStorage();

const KEYS = {
  surahList: 'quran_surah_list',
  surah: (n: number) => `quran_surah_${n}`,
  bookmarks: 'quran_bookmarks',
  lastRead: 'quran_last_read',
};

const readJson = <T>(key: string): T | null => {
  const raw = storage.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  storage.set(key, JSON.stringify(value));
};

const useQuran = () => {
  const api = useRef(new QuranApi()).current;

  const [surahList, setSurahList] = useState<SurahMeta[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(false);

  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [surahLoading, setSurahLoading] = useState(false);
  const [surahError, setSurahError] = useState(false);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(
    () => readJson<Bookmark[]>(KEYS.bookmarks) ?? []
  );
  const [lastRead, setLastRead] = useState<LastRead | null>(() =>
    readJson<LastRead>(KEYS.lastRead)
  );

  const fetchSurahList = useCallback(async () => {
    const cached = readJson<SurahMeta[]>(KEYS.surahList);
    if (cached && cached.length > 0) {
      setSurahList(cached);
      return;
    }

    setListLoading(true);
    setListError(false);
    const result = await api.fetchSurahList();
    setListLoading(false);

    if (result) {
      setSurahList(result);
      writeJson(KEYS.surahList, result);
    } else {
      setListError(true);
    }
  }, [api]);

  const fetchSurah = useCallback(
    async (surahNumber: number) => {
      setCurrentSurah(null);
      const cached = readJson<Surah>(KEYS.surah(surahNumber));
      if (cached) {
        setCurrentSurah(cached);
        return;
      }

      setSurahLoading(true);
      setSurahError(false);
      const result = await api.fetchSurah(surahNumber);
      setSurahLoading(false);

      if (result) {
        setCurrentSurah(result);
        writeJson(KEYS.surah(surahNumber), result);
      } else {
        setSurahError(true);
      }
    },
    [api]
  );

  const toggleBookmark = useCallback((b: Omit<Bookmark, 'savedAt'>) => {
    setBookmarks((prev) => {
      const exists = prev.some(
        (bk) => bk.surahNumber === b.surahNumber && bk.ayahNumber === b.ayahNumber
      );
      const updated = exists
        ? prev.filter((bk) => !(bk.surahNumber === b.surahNumber && bk.ayahNumber === b.ayahNumber))
        : [...prev, { ...b, savedAt: Date.now() }];
      writeJson(KEYS.bookmarks, updated);
      return updated;
    });
  }, []);

  const isBookmarked = useCallback(
    (surahNumber: number, ayahNumber: number) =>
      bookmarks.some((b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber),
    [bookmarks]
  );

  const saveLastRead = useCallback((pos: LastRead) => {
    setLastRead(pos);
    writeJson(KEYS.lastRead, pos);
  }, []);

  // Load surah list on mount if not cached in state
  useEffect(() => {
    if (surahList.length === 0) fetchSurahList();
  }, [fetchSurahList, surahList.length]);

  return {
    surahList,
    listLoading,
    listError,
    fetchSurahList,
    currentSurah,
    surahLoading,
    surahError,
    fetchSurah,
    bookmarks,
    toggleBookmark,
    isBookmarked,
    lastRead,
    saveLastRead,
  };
};

export default useQuran;
