import { StyleSheet, FlatList, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Icon, SearchBar, useTheme } from '@rneui/themed';
import LoadingList from '@/components/LoadingList';
import getStorage from '@/utils/localStore';
import * as SplashScreen from 'expo-splash-screen';
import Page from '@/components/Page';
import usePTAreas from '@/hooks/usePTAreas';
import NetworkError from '@/components/NetworkError';
import AreaCard from '@/components/AreaCard';

export default function Areas() {
  const { areas, isLoading, error, retry } = usePTAreas();
  const [search, setSearch] = useState('');
  const { theme } = useTheme();

  const filteredAreas = useMemo(() => {
    if (!search.trim()) return areas;
    const query = search.toLowerCase().trim();
    return areas.filter((area) => area.toLowerCase().includes(query));
  }, [areas, search]);

  const navigateHome = (area: string) => {
    const storage = getStorage();
    storage.set('area', area);

    router.dismissAll();
    router.replace('/home');
  };

  useFocusEffect(
    useCallback(() => {
      SplashScreen.hide();
    }, [])
  );

  return (
    <Page name="areas" title="Select Area" showBackground>
      <NetworkError error={error} onRetry={retry} />
      {isLoading ? (
        <LoadingList />
      ) : !error ? (
        <FlatList
          data={filteredAreas}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
              <SearchBar
                placeholder="Search areas..."
                onChangeText={setSearch}
                value={search}
                platform="default"
                round
                containerStyle={[
                  styles.searchBarContainer,
                  { backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 },
                ]}
                inputContainerStyle={[
                  styles.searchInputContainer,
                  { backgroundColor: theme.colors.bgLight },
                ]}
                inputStyle={{ color: theme.colors.text, fontFamily: 'Inter-Medium', fontSize: 16 }}
                placeholderTextColor={theme.colors.text + '80'}
                searchIcon={<Icon name="search" size={20} color={theme.colors.primary} />}
                clearIcon={
                  <Icon
                    name="close"
                    size={20}
                    color={theme.colors.text}
                    onPress={() => setSearch('')}
                  />
                }
              />
            </View>
          }
          renderItem={({ item }) => <AreaCard area={item} onPress={navigateHome} />}
          contentContainerStyle={styles.list}
          stickyHeaderIndices={[0]}
        />
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBarContainer: {
    paddingHorizontal: 0,
  },
  searchInputContainer: {
    borderRadius: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
});
