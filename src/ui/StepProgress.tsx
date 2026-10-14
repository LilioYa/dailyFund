import { View } from 'react-native';

import { useTranslation } from '@/i18n';
import { AppText } from './AppText';
import { usePalette } from './theme';

interface Props {
  step: number;
  total: number;
}

/** Segmented progress bar with "Step n of total" under it. */
export function StepProgress({ step, total }: Props) {
  const { t } = useTranslation();
  const palette = usePalette();
  const label = t('setup.step', { step, total });
  return (
    <View style={{ gap: 10 }} accessible accessibilityLabel={label}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: index < step ? palette.accent : palette.inputBorder,
            }}
          />
        ))}
      </View>
      <AppText size={13} weight="bold" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}
