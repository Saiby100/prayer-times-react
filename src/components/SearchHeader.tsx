import { StyleSheet, View } from 'react-native';
import { Icon, SearchBar, useTheme } from '@rneui/themed';
import Scrim from '@/components/Scrim';

type SearchHeaderProps = {
  /** Current search input value. */
  value: string;
  /** Called when the search text changes. */
  onChangeText: (text: string) => void;
  /** Placeholder text shown when input is empty. */
  placeholder?: string;
};

const SearchHeader = ({ value, onChangeText, placeholder = 'Search...' }: SearchHeaderProps) => {
  const { theme } = useTheme();

  return (
    <Scrim style={styles.scrim}>
      <View style={styles.container}>
        <SearchBar
          placeholder={placeholder}
          onChangeText={onChangeText}
          value={value}
          platform="default"
          round
          containerStyle={[
            styles.barContainer,
            { backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 },
          ]}
          inputContainerStyle={[styles.inputContainer, { backgroundColor: theme.colors.bgLight }]}
          inputStyle={{ color: theme.colors.text, fontFamily: 'Inter-Medium', fontSize: 16 }}
          placeholderTextColor={theme.colors.text + '80'}
          searchIcon={<Icon name="search" size={20} color={theme.colors.primary} />}
          clearIcon={
            <Icon
              name="close"
              size={20}
              color={theme.colors.text}
              onPress={() => onChangeText('')}
            />
          }
        />
      </View>
    </Scrim>
  );
};

export default SearchHeader;

const styles = StyleSheet.create({
  scrim: {
    marginBottom: 0,
    paddingVertical: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  barContainer: {
    paddingHorizontal: 0,
  },
  inputContainer: {
    borderRadius: 12,
  },
});
