import { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from '@rneui/themed';
import type { AllahName } from '@/config/ninetyNineNames';

type NameRowColors = {
  primary: string;
  text: string;
  sliderTrack: string;
};

type NameRowProps = {
  item: AllahName;
  colors: NameRowColors;
};

const NameRow = memo(function NameRow({ item, colors }: NameRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable onPress={() => setExpanded((prev) => !prev)} style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{item.number}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.arabic, { color: colors.text }]}>{item.arabic}</Text>
          <Text style={[styles.transliteration, { color: colors.primary }]}>
            {item.transliteration}
          </Text>
          <Text style={[styles.meaning, { color: colors.text }]}>{item.meaning}</Text>
        </View>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          type="feather"
          size={18}
          color={colors.primary}
          style={styles.chevron}
        />
      </View>
      {expanded && (
        <View style={[styles.description, { borderTopColor: colors.sliderTrack }]}>
          <Text style={[styles.descriptionText, { color: colors.text }]}>{item.description}</Text>
        </View>
      )}
    </Pressable>
  );
});

export default NameRow;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  arabic: {
    fontSize: 26,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 38,
  },
  transliteration: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  meaning: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  chevron: {
    marginLeft: 8,
    flexShrink: 0,
  },
  description: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.75,
  },
});
