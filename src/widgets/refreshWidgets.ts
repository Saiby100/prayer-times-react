import { requestWidgetUpdate } from 'react-native-android-widget';
import log from '@/utils/logger';
import type { WidgetData } from '@/utils/widgetData';
import { WIDGET_NAMES, drawWidget, loadData } from './drawWidget';

/**
 * Redraws every widget on the home screen from the saved area, hidden prayers and theme. Data is
 * loaded once, and only when a widget is placed. Does nothing on iOS / web; never throws.
 */
export async function refreshWidgets(): Promise<void> {
  let data: Promise<WidgetData> | null = null;
  const getData = () => (data ??= loadData());

  await Promise.all(
    WIDGET_NAMES.map(async (widgetName) => {
      try {
        await requestWidgetUpdate({
          widgetName,
          renderWidget: async () => drawWidget(widgetName, await getData()),
        });
      } catch (error) {
        // e.g. a development build without the widget module.
        log.debug('widget: redraw failed', { type: 'refresh-widgets', widgetName, error });
      }
    })
  );
}
