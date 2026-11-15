import type { WidgetRepresentation } from 'react-native-android-widget';
import { getPickedThemeId } from '@/stores';
import { loadWidgetData } from '@/services/widgets/loadWidgetData';
import type { ThemeColors } from '@/theme/presets';
import log from '@/utils/logger';
import type { WidgetData } from '@/utils/widgetData';
import NextPrayerWidget from './NextPrayerWidget';
import { getWidgetThemes } from './widgetTheme';

/** Widget names, as in the `react-native-android-widget` plugin config in `app.config.ts`. */
export type WidgetName = 'NextPrayer';

const WIDGETS: Record<WidgetName, (data: WidgetData, colors: ThemeColors) => React.JSX.Element> = {
  NextPrayer: (data, colors) => <NextPrayerWidget data={data} colors={colors} />,
};

/** Every widget the app has, so a redraw reaches each one. */
export const WIDGET_NAMES = Object.keys(WIDGETS) as WidgetName[];

export function isWidgetName(name: string): name is WidgetName {
  return name in WIDGETS;
}

/** What the widgets show now; never throws, a failure shows the "not loaded" message. */
export async function loadData(): Promise<WidgetData> {
  try {
    return await loadWidgetData();
  } catch (error) {
    log.warn('widget: loading data failed', { type: 'draw-widget', error });
    return { state: 'not-loaded', area: '' };
  }
}

/** Widget `name` drawn from `data` in the current widget theme(s). */
export function drawWidget(name: WidgetName, data: WidgetData): WidgetRepresentation {
  const themes = getWidgetThemes(getPickedThemeId());
  const draw = WIDGETS[name];
  // The library builds `dark` whenever the key exists, even when null, so pass one element instead.
  return themes.dark
    ? { light: draw(data, themes.light), dark: draw(data, themes.dark) }
    : draw(data, themes.light);
}
