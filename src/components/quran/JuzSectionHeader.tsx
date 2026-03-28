import { StyleSheet, View } from 'react-native';
import { Text } from '@rneui/themed';

type JuzSectionHeaderProps = {
  juzNumber: number;
  colors: { sliderTrack: string; text: string };
};

const JuzSectionHeader = ({ juzNumber, colors }: JuzSectionHeaderProps) => (
  <View style={[styles.container, { borderBottomColor: colors.sliderTrack }]}>
    <View style={[styles.line, { backgroundColor: colors.sliderTrack }]} />
    <Text style={[styles.text, { color: colors.text, opacity: 0.6 }]}>Juz {juzNumber}</Text>
    <View style={[styles.line, { backgroundColor: colors.sliderTrack }]} />
  </View>
);

export default JuzSectionHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  text: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
});
