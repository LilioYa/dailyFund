import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { setUp, totalFixedCharges, type BudgetSettings, type FixedCharge } from '@/domain/budget';
import { addDays, daysUntilPayday, localToday } from '@/domain/calendar';
import { parseAmount } from '@/domain/money';
import { useFormatAmount, useFormatDate, useFormatMoney, useTranslation } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useSetupDraft } from '@/store/setupDraft';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { EditableItems } from '@/ui/EditableItems';
import { Screen } from '@/ui/Screen';
import { Section } from '@/ui/Section';
import { Segmented } from '@/ui/Segmented';
import { StepProgress } from '@/ui/StepProgress';
import { TextField } from '@/ui/TextField';
import { radius, usePalette } from '@/ui/theme';

/** Setup step 2: fixed charges, money on the account now, then a preview of the daily budget. */
export default function SetupMoneyScreen() {
  const { t } = useTranslation();
  const palette = usePalette();
  const formatMoney = useFormatMoney();
  const formatAmount = useFormatAmount();
  const formatDate = useFormatDate();
  const draft = useSetupDraft();
  const completeSetup = useAppStore((s) => s.completeSetup);
  const [error, setError] = useState<string>();

  // Step 1 validated these; parse again since the draft only holds text
  const settings: BudgetSettings = {
    mainIncome: { amount: parseAmount(draft.mainIncome) ?? 0, day: draft.payDay },
    otherIncomes: draft.otherIncomes,
    fixedCharges: draft.fixedCharges,
    monthlySavings: draft.savings.trim() === '' ? 0 : (parseAmount(draft.savings) ?? 0),
  };
  const currentMoney = parseAmount(draft.currentMoney);
  const today = localToday();
  const days = daysUntilPayday(today, draft.payDay);
  const preview =
    currentMoney === null ? null : setUp(currentMoney, draft.chargesAlreadyPaid, today, settings);

  // The draft is not saved: after a reload on the web, step 1 must be filled again
  if (parseAmount(draft.mainIncome) === null) return <Redirect href="/setup" />;

  const start = () => {
    if (currentMoney === null) {
      setError(t('setup.errors.currentMoney'));
      return;
    }
    completeSetup(settings, currentMoney, draft.chargesAlreadyPaid);
    draft.reset();
    router.replace('/');
  };

  return (
    <Screen footer={<Button label={t('setup.start')} onPress={start} />}>
      <View style={{ gap: 10 }}>
        <StepProgress step={2} total={2} />
        <AppText size={28} weight="extrabold" accessibilityRole="header">
          {t('setup.moneyTitle')}
        </AppText>
      </View>

      <Section
        title={t('setup.fixedCharges')}
        aside={formatAmount(totalFixedCharges(settings))}
        footer={t('setup.fixedChargesHint')}
      >
        <EditableItems<FixedCharge>
          items={draft.fixedCharges}
          onChange={(fixedCharges) => draft.update({ fixedCharges })}
          withDay={false}
          addLabel={t('items.addCharge')}
        />
      </Section>

      <Card style={{ padding: 16, gap: 14 }}>
        <TextField
          label={t('setup.currentMoney')}
          value={draft.currentMoney}
          onChangeText={(text) => {
            draft.update({ currentMoney: text });
            setError(undefined);
          }}
          error={error}
          keyboardType="numbers-and-punctuation"
          emphasized
        />
        <View style={{ gap: 6 }}>
          <AppText size={13} weight="bold" color="textMuted">
            {t('setup.chargesPaid')}
          </AppText>
          <Segmented
            accessibilityLabel={t('setup.chargesPaid')}
            options={[
              { value: 'yes', label: t('setup.yes') },
              { value: 'no', label: t('setup.notYet') },
            ]}
            value={draft.chargesAlreadyPaid ? 'yes' : 'no'}
            onChange={(value) => draft.update({ chargesAlreadyPaid: value === 'yes' })}
          />
        </View>
      </Card>

      {preview ? (
        <View
          accessibilityLiveRegion="polite"
          style={{
            backgroundColor: palette.accentSoft,
            borderRadius: radius.segment + 2,
            padding: 16,
            gap: 2,
          }}
        >
          <AppText size={14} weight="semibold" style={{ color: palette.onAccentSoft }}>
            {t('setup.previewIntro')}
          </AppText>
          <AppText size={22} weight="extrabold" tabular style={{ color: palette.onAccentSoft }}>
            {t('setup.previewPerDay', { amount: formatMoney(preview.perDay) })}
          </AppText>
          <AppText size={13} weight="semibold" style={{ color: palette.onAccentSoft }}>
            {t('setup.previewUntil', {
              date: formatDate(addDays(today, days), { day: 'numeric', month: 'long' }),
              count: days,
            })}
          </AppText>
        </View>
      ) : null}
    </Screen>
  );
}
