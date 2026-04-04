import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListItem, Text, useTheme } from '@rneui/themed';
import Scrim from '@/components/Scrim';
import type { AllahName } from '@/config/ninetyNineNames';

type NameRowColors = {
  /** Primary accent color. */
  primary: string;
  /** Main text color. */
  text: string;
  /** Divider color between content and description. */
  sliderTrack: string;
};

type NameRowProps = {
  /** Name of Allah data to display. */
  item: AllahName;
  /** Theme-derived colors for the row. */
  colors: NameRowColors;
};

const NameRow = memo(function NameRow({ item, colors }: NameRowProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Scrim style={[styles.card, expanded && { backgroundColor: theme.colors.background }]}>
      <ListItem.Accordion
        isExpanded={expanded}
        onPress={() => setExpanded((prev) => !prev)}
        icon={{ name: 'chevron-down', type: 'feather', size: 18, color: colors.primary }}
        containerStyle={[styles.container, { backgroundColor: 'transparent' }]}
        content={
          <View style={styles.content}>
            <View style={styles.topRow}>
              <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{item.number}</Text>
              </View>
              <Text style={[styles.arabic, { color: colors.text }]}>{item.arabic}</Text>
            </View>
            <View style={styles.bottomLeft}>
              <Text style={[styles.transliteration, { color: colors.primary }]}>
                {item.transliteration}
              </Text>
              <Text style={[styles.meaning, { color: colors.text }]}>{item.meaning}</Text>
            </View>
          </View>
        }
      >
        <View style={[styles.description, { borderTopColor: colors.sliderTrack }]}>
          <Text style={[styles.descriptionText, { color: colors.text }]}>{item.description}</Text>
        </View>
      </ListItem.Accordion>
    </Scrim>
  );
});

export default NameRow;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 0,
    marginVertical: 0,
    paddingVertical: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  arabic: {
    fontSize: 26,
    writingDirection: 'rtl',
    lineHeight: 38,
  },
  bottomLeft: {
    marginTop: 4,
    gap: 2,
  },
  transliteration: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  meaning: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  description: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.75,
  },
});
