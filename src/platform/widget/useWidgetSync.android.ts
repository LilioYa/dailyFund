import { useEffect } from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';

import { useAppStore } from '@/store/appStore';
import { renderTodayWidget, WIDGET_NAME } from './renderTodayWidget';

/** Redraws the home screen widget whenever the budget, settings or preferences change. */
export function useWidgetSync(hydrated: boolean): void {
  const settings = useAppStore((s) => s.settings);
  const budget = useAppStore((s) => s.budget);
  const preferences = useAppStore((s) => s.preferences);

  useEffect(() => {
    // Before loading, the empty initial state would show the setup hint
    if (!hydrated) return;
    const data = useAppStore.getState();
    requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: () => renderTodayWidget(data),
    }).catch((error: unknown) => console.error('Failed to update the widget', error));
  }, [hydrated, settings, budget, preferences]);
}
