import 'expo-router/entry';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from '@/widgets/widgetTaskHandler';

// Home screen widgets draw in a headless JS task, registered at the entry so it runs without the UI.
registerWidgetTaskHandler(widgetTaskHandler);
