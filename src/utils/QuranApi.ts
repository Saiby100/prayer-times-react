import log from '@/utils/logger';
import { SURAH_JUZ_START } from '@/utils/quranData';
import type { SurahMeta, Surah, Ayah } from '@/types/quran';

const BASE = 'https://api.alquran.cloud/v1';

class QuranApi {
  fetchSurahList = async (): Promise<SurahMeta[] | undefined> => {
    try {
      log.info('QuranApi: fetching surah list', { type: 'api' });
      const response = await fetch(`${BASE}/surah`);
      const json = await response.json();

      const surahs: SurahMeta[] = json.data.map(
        (s: {
          number: number;
          name: string;
          englishName: string;
          numberOfAyahs: number;
          revelationType: string;
        }) => ({
          number: s.number,
          name: s.name,
          englishName: s.englishName,
          numberOfAyahs: s.numberOfAyahs,
          revelationType: s.revelationType as 'Meccan' | 'Medinan',
          juzStart: SURAH_JUZ_START[s.number] ?? 1,
        })
      );

      log.info('QuranApi: fetched surah list', { type: 'api', count: surahs.length });
      return surahs;
    } catch (error) {
      log.error('QuranApi: error fetching surah list', { type: 'api', error: String(error) });
    }
  };

  fetchSurah = async (surahNumber: number): Promise<Surah | undefined> => {
    try {
      log.info('QuranApi: fetching surah', { type: 'api', surahNumber });
      const response = await fetch(`${BASE}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`);
      const json = await response.json();

      const [arabicEdition, englishEdition] = json.data;

      const ayahs: Ayah[] = arabicEdition.ayahs.map(
        (a: { numberInSurah: number; number: number; text: string; juz: number }, i: number) => ({
          number: a.numberInSurah,
          numberInQuran: a.number,
          arabic: a.text,
          translation: englishEdition.ayahs[i].text,
          juz: a.juz,
        })
      );

      const surah: Surah = {
        number: arabicEdition.number,
        name: arabicEdition.name,
        englishName: arabicEdition.englishName,
        numberOfAyahs: arabicEdition.numberOfAyahs,
        revelationType: arabicEdition.revelationType as 'Meccan' | 'Medinan',
        juzStart: SURAH_JUZ_START[arabicEdition.number] ?? 1,
        ayahs,
      };

      log.info('QuranApi: fetched surah', { type: 'api', surahNumber, ayahCount: ayahs.length });
      return surah;
    } catch (error) {
      log.error('QuranApi: error fetching surah', {
        type: 'api',
        surahNumber,
        error: String(error),
      });
    }
  };
}

export default QuranApi;
