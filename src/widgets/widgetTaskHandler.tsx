import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { getPickedThemeId } from '@/stores';
import { loadWidgetData } from '@/services/widgets/loadWidgetData';
import type { ThemeColors } from '@/theme/presets';
import log from '@/utils/logger';
import type { WidgetData } from '@/utils/widgetData';
import NextPrayerWidget from './NextPrayerWidget';
import { getWidgetThemes } from './widgetTheme';

/** Widget names, as in the `react-native-android-widget` plugin config in `app.config.ts`. */
type WidgetName = 'NextPrayer';

const WIDGETS: Record<WidgetName, (data: WidgetData, colors: ThemeColors) => React.JSX.Element> = {
  NextPrayer: (data, colors) => <NextPrayerWidget data={data} colors={colors} />,
};

function isWidgetName(name: string): name is WidgetName {
  return name in WIDGETS;
}

async function loadData(widgetName: string): Promise<WidgetData> {
  try {
    return await loadWidgetData();
  } catch (error) {
    log.warn('widget: loading data failed', { type: 'draw-widget', widgetName, error });
    return { state: 'not-loaded', area: '' };
  }
}

/** Draws a widget when Android adds, updates or resizes it. Taps open the app natively. */
export async function widgetTaskHandler({
  widgetInfo,
  widgetAction,
  renderWidget,
}: WidgetTaskHandlerProps): Promise<void> {
  // WIDGET_CLICK: OPEN_APP is handled natively. WIDGET_DELETED: nothing to draw.
  if (widgetAction === 'WIDGET_CLICK' || widgetAction === 'WIDGET_DELETED') return;
  const { widgetName } = widgetInfo;
  if (!isWidgetName(widgetName)) return;

  const data = await loadData(widgetName);
  const themes = getWidgetThemes(getPickedThemeId());
  const draw = WIDGETS[widgetName];
  // The library builds `dark` whenever the key exists, even when null, so pass one element instead.
  renderWidget(
    themes.dark
      ? { light: draw(data, themes.light), dark: draw(data, themes.dark) }
      : draw(data, themes.light)
  );
}
