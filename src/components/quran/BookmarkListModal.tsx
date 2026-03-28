import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Overlay, Text, useTheme } from '@rneui/themed';
import type { Bookmark } from '@/types/quran';

type BookmarkListModalProps = {
  visible: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onSelect: (b: Bookmark) => void;
};

const BookmarkListModal = ({ visible, onClose, bookmarks, onSelect }: BookmarkListModalProps) => {
  const { theme } = useTheme();

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      overlayStyle={[styles.overlay, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Bookmarks</Text>
      {bookmarks.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.text, opacity: 0.5 }]}>
          No bookmarks yet
        </Text>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(b) => `${b.surahNumber}-${b.ayahNumber}`}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: theme.colors.sliderTrack }]}
              onPress={() => onSelect(item)}
              activeOpacity={0.6}
            >
              <Text style={[styles.surahName, { color: theme.colors.primary }]}>
                {item.surahName}
              </Text>
              <Text style={[styles.ayahNum, { color: theme.colors.text, opacity: 0.6 }]}>
                Ayah {item.ayahNumber}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </Overlay>
  );
};

export default BookmarkListModal;

const styles = StyleSheet.create({
  overlay: {
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '60%',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  empty: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  surahName: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  ayahNum: {
    fontSize: 13,
  },
});
