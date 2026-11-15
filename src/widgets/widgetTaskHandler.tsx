import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { drawWidget, isWidgetName, loadData } from './drawWidget';

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

  renderWidget(drawWidget(widgetName, await loadData()));
}
