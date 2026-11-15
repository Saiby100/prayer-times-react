import { FlexWidget, IconWidget, TextWidget, type HexColor } from 'react-native-android-widget';
import type { ThemeColors } from '@/theme/presets';
import { getPrayerIcon } from '@/utils/prayerNames';
import type { WidgetData } from '@/utils/widgetData';
import { FEATHER_FONT, featherGlyph } from './featherGlyph';
import { WIDGET_MESSAGES } from './widgetMessages';

type NextPrayerWidgetProps = {
  /** What to show: the next prayer, or an empty state. */
  data: WidgetData;
  /** Theme palette to draw in. */
  colors: ThemeColors;
};

const hex = (color: string) => color as HexColor;

/** Small widget: the next prayer's icon, name, start time and the area, on the theme's bgLight. */
const NextPrayerWidget = ({ data, colors }: NextPrayerWidgetProps) => (
  <FlexWidget
    clickAction="OPEN_APP"
    style={{
      height: 'match_parent',
      width: 'match_parent',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: hex(colors.bgLight),
    }}
  >
    {data.state === 'ready' ? (
      <NextPrayer data={data} colors={colors} />
    ) : (
      <TextWidget
        text={WIDGET_MESSAGES[data.state]}
        maxLines={2}
        truncate="END"
        style={{ fontSize: 13, fontFamily: 'Inter-Medium', color: hex(colors.text) }}
      />
    )}
  </FlexWidget>
);

type NextPrayerProps = {
  /** Ready widget data. */
  data: Extract<WidgetData, { state: 'ready' }>;
  /** Theme palette to draw in. */
  colors: ThemeColors;
};

const NextPrayer = ({ data, colors }: NextPrayerProps) => {
  const { name } = data.next;
  const time = data.rows.find((row) => row.name === name)?.time ?? '';
  return (
    <FlexWidget style={{ width: 'match_parent', flexGap: 2 }}>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 8 }}>
        <IconWidget
          icon={featherGlyph(getPrayerIcon(name))}
          font={FEATHER_FONT}
          size={16}
          style={{ color: hex(colors.primary) }}
        />
        <TextWidget
          text={name}
          style={{ fontSize: 16, fontFamily: 'Inter-SemiBold', color: hex(colors.primary) }}
        />
      </FlexWidget>
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexGap: 8,
        }}
      >
        <TextWidget
          text={time}
          style={{ fontSize: 24, fontFamily: 'Inter-SemiBold', color: hex(colors.text) }}
        />
        <TextWidget
          text={data.area}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 12, fontFamily: 'Inter-Medium', color: hex(colors.text + 'B3') }}
        />
      </FlexWidget>
    </FlexWidget>
  );
};

export default NextPrayerWidget;
