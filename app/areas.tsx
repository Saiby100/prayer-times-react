import { StyleSheet, FlatList } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import LoadingList from '@/components/LoadingList';
import { setArea } from '@/stores';
import * as SplashScreen from 'expo-splash-screen';
import Page from '@/components/Page';
import usePTAreas from '@/hooks/usePTAreas';
import AreaCard from '@/components/AreaCard';
import SearchHeader from '@/components/SearchHeader';

export default function Areas() {
  const { areas, isLoading, error, retry } = usePTAreas();
  const [search, setSearch] = useState('');

  const filteredAreas = useMemo(() => {
    if (!search.trim()) return areas;
    const query = search.toLowerCase().trim();
    return areas.filter((area) => area.toLowerCase().includes(query));
  }, [areas, search]);

  const navigateHome = (area: string) => {
    setArea(area);
    router.dismissAll();
    router.replace('/home');
  };

  useFocusEffect(
    useCallback(() => {
      SplashScreen.hide();
    }, [])
  );

  return (
    <Page name="areas" title="Select Area" showBackground error={error} onRetry={retry}>
      {isLoading ? (
        <LoadingList />
      ) : (
        <FlatList
          data={filteredAreas}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={
            <SearchHeader value={search} onChangeText={setSearch} placeholder="Search areas..." />
          }
          renderItem={({ item }) => <AreaCard area={item} onPress={navigateHome} />}
          contentContainerStyle={styles.list}
          stickyHeaderIndices={[0]}
          keyboardDismissMode="on-drag"
        />
      )}
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
