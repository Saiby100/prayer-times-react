import { StyleSheet, View } from 'react-native';
import { Button } from '@rneui/themed';
import type { SurahMeta } from '@/types/quran';

type SurahNavFooterProps = {
  surahNumber: number;
  surahList: SurahMeta[];
  onNavigate: (surahNumber: number) => void;
};

const SurahNavFooter = ({ surahNumber, surahList, onNavigate }: SurahNavFooterProps) => {
  const prev = surahList.find((s) => s.number === surahNumber - 1);
  const next = surahList.find((s) => s.number === surahNumber + 1);

  return (
    <View style={styles.container}>
      {prev ? (
        <Button
          type="outline"
          size="sm"
          radius="md"
          title={prev.englishName}
          icon={{ name: 'chevron-left', type: 'feather', size: 16 }}
          buttonStyle={styles.button}
          titleStyle={styles.title}
          onPress={() => onNavigate(prev.number)}
          containerStyle={styles.buttonContainer}
        />
      ) : (
        <View />
      )}
      {next ? (
        <Button
          type="outline"
          size="sm"
          radius="md"
          title={next.englishName}
          iconRight
          icon={{ name: 'chevron-right', type: 'feather', size: 16 }}
          buttonStyle={styles.button}
          titleStyle={styles.title}
          onPress={() => onNavigate(next.number)}
          containerStyle={styles.buttonContainer}
        />
      ) : (
        <View />
      )}
    </View>
  );
};

export default SurahNavFooter;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  buttonContainer: {
    maxWidth: '45%',
  },
  button: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  title: {
    fontSize: 13,
  },
});
