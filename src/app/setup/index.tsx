import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import type { RecurringIncome } from '@/domain/budget';
import { parseAmount } from '@/domain/money';
import { useTranslation } from '@/i18n';
import { useSetupDraft } from '@/store/setupDraft';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { DayStepper } from '@/ui/DayStepper';
import { EditableItems } from '@/ui/EditableItems';
import { Screen } from '@/ui/Screen';
import { Section } from '@/ui/Section';
import { StepProgress } from '@/ui/StepProgress';
import { TextField } from '@/ui/TextField';

/** Setup step 1: main income (defines the period), savings and other recurring incomes. */
export default function SetupIncomeScreen() {
  const { t } = useTranslation();
  const draft = useSetupDraft();
  const [errors, setErrors] = useState<{ mainIncome?: string; savings?: string }>({});

  const next = () => {
    const mainIncome = parseAmount(draft.mainIncome);
    const savings = draft.savings.trim() === '' ? 0 : parseAmount(draft.savings);
    const nextErrors = {
      mainIncome: mainIncome !== null && mainIncome > 0 ? undefined : t('setup.errors.mainIncome'),
      savings: savings !== null && savings >= 0 ? undefined : t('items.errors.amount'),
    };
    setErrors(nextErrors);
    if (!nextErrors.mainIncome && !nextErrors.savings) router.push('/setup/money');
  };

  return (
    <Screen footer={<Button label={t('setup.continue')} onPress={next} />}>
      <View style={{ gap: 10 }}>
        <StepProgress step={1} total={2} />
        <AppText size={28} weight="extrabold" accessibilityRole="header">
          {t('setup.incomeTitle')}
        </AppText>
        <AppText size={15} color="textMuted" style={{ lineHeight: 22 }}>
          {t('setup.incomeIntro')}
        </AppText>
      </View>

      <Card style={{ padding: 16, gap: 14 }}>
        <TextField
          label={t('setup.mainIncome')}
          value={draft.mainIncome}
          onChangeText={(mainIncome) => draft.update({ mainIncome })}
          error={errors.mainIncome}
          keyboardType="decimal-pad"
          emphasized
        />
        <DayStepper
          label={t('setup.payDay')}
          value={draft.payDay}
          onChange={(payDay) => draft.update({ payDay })}
        />
        <TextField
          label={t('setup.savings')}
          value={draft.savings}
          onChangeText={(savings) => draft.update({ savings })}
          error={errors.savings}
          placeholder="0"
          keyboardType="decimal-pad"
          emphasized
        />
      </Card>

      <Section title={t('setup.otherIncomes')} footer={t('setup.otherIncomesHint')}>
        <EditableItems<RecurringIncome>
          items={draft.otherIncomes}
          onChange={(otherIncomes) => draft.update({ otherIncomes })}
          withDay
          addLabel={t('items.addIncome')}
        />
      </Section>
    </Screen>
  );
}
