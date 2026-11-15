import type { WidgetData } from '@/utils/widgetData';

/** Text a widget shows instead of times, per empty state. */
export const WIDGET_MESSAGES: Record<Exclude<WidgetData['state'], 'ready'>, string> = {
  'no-area': 'Open the app to choose your area',
  'not-loaded': 'Open the app to load prayer times',
  'all-hidden': 'All prayers are hidden',
};
