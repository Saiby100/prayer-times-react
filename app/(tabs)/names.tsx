import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useTheme } from '@rneui/themed';
import Page from '@/components/Page';
import NameRow from '@/components/NameRow';
import SearchHeader from '@/components/SearchHeader';
import { allahNames, type AllahName } from '@/config/ninetyNineNames';

export default function NamesScreen() {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const colors = {
    primary: theme.colors.primary,
    text: theme.colors.text,
    sliderTrack: theme.colors.sliderTrack,
    bgLight: theme.colors.bgLight,
  };

  const filteredNames = useMemo(() => {
    if (!search.trim()) return allahNames;
    const query = search.toLowerCase().trim();
    return allahNames.filter(
      (name) =>
        name.transliteration.toLowerCase().includes(query) ||
        name.meaning.toLowerCase().includes(query)
    );
  }, [search]);

  const renderItem = useCallback(
    ({ item }: { item: AllahName }) => <NameRow item={item} colors={colors} />,
    [theme.mode]
  );

  return (
    <Page name="names" title="99 Names of Allah" showBackground>
      <FlatList
        data={filteredNames}
        keyExtractor={(item) => item.number.toString()}
        ListHeaderComponent={
          <SearchHeader value={search} onChangeText={setSearch} placeholder="Search names..." />
        }
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        stickyHeaderIndices={[0]}
        initialNumToRender={12}
        maxToRenderPerBatch={15}
        windowSize={5}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
});
