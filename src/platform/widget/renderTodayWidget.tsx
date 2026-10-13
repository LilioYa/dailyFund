import type { WidgetRepresentation } from 'react-native-android-widget';

import { localToday } from '@/domain/calendar';
import { fixedFormatting } from '@/i18n';
import type { AppData } from '@/store/appStore';
import { withSign } from '@/ui/text';
import { palettes } from '@/ui/theme';
import { widgetSnapshot } from '../widgetSnapshot';
import { TodayWidget, type TodayWidgetProps } from './TodayWidget';

/** Must match the widget name in app.json. */
export const WIDGET_NAME = 'Today';

/** The widget for the saved data, in light and dark (Android picks one with the system theme). */
export function renderTodayWidget(data: AppData): WidgetRepresentation {
  const { t, formatMoney } = fixedFormatting(data.preferences.language, data.preferences.currency);
  const snapshot = widgetSnapshot(data.settings, data.budget, localToday());
  const overspent = snapshot !== null && snapshot.todayLeft < 0;

  const content: Omit<TodayWidgetProps, 'palette'> = snapshot
    ? {
        label: overspent ? t('home.overspent') : t('home.leftToday'),
        amount: formatMoney(Math.abs(snapshot.todayLeft)),
        overspent,
        reserve: `${t('home.reserve')} ${withSign(snapshot.balance, formatMoney)}`,
        addLabel: t('quickAdd.open'),
      }
    : {
        label: t('widget.setUp'),
        amount: null,
        overspent: false,
        reserve: null,
        addLabel: t('quickAdd.open'),
      };

  return {
    light: <TodayWidget palette={palettes.light} {...content} />,
    dark: <TodayWidget palette={palettes.dark} {...content} />,
  };
}
