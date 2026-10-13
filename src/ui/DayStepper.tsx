import { View } from 'react-native';

import { useDayOfMonth, useTranslation } from '@/i18n';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

interface Props {
  label: string;
  /** Day of month, 1-31. */
  value: number;
  onChange: (day: number) => void;
}

/** Picks a day of the month with − / + buttons (31 means the last day of shorter months). */
export function DayStepper({ label, value, onChange }: Props) {
  const { t } = useTranslation();
  const dayOfMonth = useDayOfMonth();
  return (
    <View style={{ gap: 6 }}>
      <AppText size={13} weight="bold" color="textMuted">
        {label}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconButton
          icon="minus"
          label={t('items.previousDay')}
          disabled={value <= 1}
          onPress={() => onChange(value - 1)}
        />
        <AppText
          size={17}
          weight="extrabold"
          style={{ flex: 1, textAlign: 'center' }}
          accessibilityLiveRegion="polite"
        >
          {dayOfMonth(value)}
        </AppText>
        <IconButton
          icon="plus"
          label={t('items.nextDay')}
          disabled={value >= 31}
          onPress={() => onChange(value + 1)}
        />
      </View>
      <AppText size={12} color="textMuted">
        {t('items.lastDayHint')}
      </AppText>
    </View>
  );
}
