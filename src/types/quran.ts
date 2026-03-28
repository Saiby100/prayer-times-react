export type SurahMeta = {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  juzStart: number;
};

export type Ayah = {
  number: number;
  numberInQuran: number;
  arabic: string;
  translation: string;
  juz: number;
};

export type Surah = SurahMeta & { ayahs: Ayah[] };

export type Bookmark = {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  numberInQuran: number;
  savedAt: number;
};

export type LastRead = {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
};
