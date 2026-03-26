import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { useTheme } from '@rneui/themed';
import Page from '@/components/Page';
import NameRow from '@/components/NameRow';
import { allahNames, type AllahName } from '@/config/ninetyNineNames';

export default function NamesScreen() {
  const { theme } = useTheme();
  const colors = {
    primary: theme.colors.primary,
    text: theme.colors.text,
    sliderTrack: theme.colors.sliderTrack,
    bgLight: theme.colors.bgLight,
  };

  const renderItem = useCallback(
    ({ item }: { item: AllahName }) => <NameRow item={item} colors={colors} />,
    [theme.mode]
  );

  return (
    <Page name="names" title="99 Names of Allah" showBackground>
      <FlatList
        data={allahNames}
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
        initialNumToRender={12}
        maxToRenderPerBatch={15}
        windowSize={5}
      />
    </Page>
  );
}
