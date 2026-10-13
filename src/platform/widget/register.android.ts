import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { useAppStore } from '@/store/appStore';
import { whenHydrated } from '@/store/lifecycle';
import { renderTodayWidget } from './renderTodayWidget';

/**
 * Android asks for the widget when it's added, resized, and every 30 minutes (so the day
 * changes even when the app isn't opened). This may run without the app UI, in a fresh JS context.
 */
registerWidgetTaskHandler(async ({ widgetAction, renderWidget }) => {
  if (widgetAction === 'WIDGET_DELETED' || widgetAction === 'WIDGET_CLICK') return;
  await whenHydrated();
  renderWidget(renderTodayWidget(useAppStore.getState()));
});
