import { useState } from 'react';
import { Switch, View } from 'react-native';

import { totalFixedCharges, type FixedCharge, type RecurringIncome } from '@/domain/budget';
import { centsToInput, parseAmount, type Cents } from '@/domain/money';
import { useDayOfMonth, useFormatAmount, useTranslation } from '@/i18n';
import { CURRENCIES } from '@/i18n/locale';
import { remindersSupported, requestReminderPermission } from '@/platform/reminders';
import { useAppStore, type Language } from '@/store/appStore';
import { AppText } from '@/ui/AppText';
import { Card } from '@/ui/Card';
import { Choices } from '@/ui/Choices';
import { DayStepper } from '@/ui/DayStepper';
import { EditableItems } from '@/ui/EditableItems';
import { EditorActions, InlineEdit } from '@/ui/InlineEdit';
import { Screen } from '@/ui/Screen';
import { Section } from '@/ui/Section';
import { TextField } from '@/ui/TextField';
import { usePalette } from '@/ui/theme';

/** Hours offered for the evening reminder. */
const REMINDER_HOURS = [18, 19, 20, 21, 22];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const formatAmount = useFormatAmount();
  const dayOfMonth = useDayOfMonth();
  const settings = useAppStore((s) => s.settings);
  const fund = useAppStore((s) => s.budget?.fund);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const setFund = useAppStore((s) => s.setFund);

  // The tabs layout redirects to setup before this can happen
  if (!settings || fund === undefined) return null;

  return (
    <Screen title={t('tabs.settings')}>
      <Section title={t('settings.incomes')}>
        <EditableItems<RecurringIncome>
          items={settings.otherIncomes}
          onChange={(otherIncomes) => updateSettings({ ...settings, otherIncomes })}
          withDay
          addLabel={t('items.addIncome')}
          leading={
            <InlineEdit
              title={t('settings.mainIncome')}
              subtitle={t('settings.mainIncomeDay', { day: dayOfMonth(settings.mainIncome.day) })}
              value={formatAmount(settings.mainIncome.amount)}
              divider
              editor={(close) => (
                <MainIncomeEditor
                  amount={settings.mainIncome.amount}
                  day={settings.mainIncome.day}
                  onSave={(mainIncome) => {
                    updateSettings({ ...settings, mainIncome });
                    close();
                  }}
                  onCancel={close}
                />
              )}
            />
          }
        />
      </Section>

      <Section
        title={t('settings.fixedCharges')}
        aside={t('settings.perMonth', { amount: formatAmount(totalFixedCharges(settings)) })}
        footer={t('settings.nextPaydayHint')}
      >
        <EditableItems<FixedCharge>
          items={settings.fixedCharges}
          onChange={(fixedCharges) => updateSettings({ ...settings, fixedCharges })}
          withDay={false}
          addLabel={t('items.addCharge')}
        />
      </Section>

      <Section title={t('settings.budget')}>
        <Card>
          <InlineEdit
            title={t('settings.savings')}
            value={formatAmount(settings.monthlySavings)}
            divider
            editor={(close) => (
              <AmountEditor
                label={t('settings.savings')}
                initial={settings.monthlySavings}
                allowNegative={false}
                onSave={(monthlySavings) => {
                  updateSettings({ ...settings, monthlySavings });
                  close();
                }}
                onCancel={close}
              />
            )}
          />
          <InlineEdit
            title={t('settings.fund')}
            subtitle={t('settings.fundHint')}
            value={formatAmount(fund)}
            editor={(close) => (
              <AmountEditor
                label={t('settings.fund')}
                initial={fund}
                allowNegative
                onSave={(value) => {
                  setFund(value);
                  close();
                }}
                onCancel={close}
              />
            )}
          />
        </Card>
      </Section>

      <Preferences />
    </Screen>
  );
}

function MainIncomeEditor({
  amount,
  day,
  onSave,
  onCancel,
}: {
  amount: Cents;
  day: number;
  onSave: (mainIncome: { amount: Cents; day: number }) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState(centsToInput(amount));
  const [payDay, setPayDay] = useState(day);
  const [error, setError] = useState<string>();

  const save = () => {
    const value = parseAmount(text);
    if (value === null || value <= 0) setError(t('setup.errors.mainIncome'));
    else onSave({ amount: value, day: payDay });
  };

  return (
    <>
      <TextField
        label={t('setup.mainIncome')}
        value={text}
        onChangeText={setText}
        error={error}
        keyboardType="decimal-pad"
        emphasized
        autoFocus
      />
      <DayStepper label={t('setup.payDay')} value={payDay} onChange={setPayDay} />
      <EditorActions onSave={save} onCancel={onCancel} />
    </>
  );
}

function AmountEditor({
  label,
  initial,
  allowNegative,
  onSave,
  onCancel,
}: {
  label: string;
  initial: Cents;
  allowNegative: boolean;
  onSave: (value: Cents) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState(centsToInput(initial));
  const [error, setError] = useState<string>();

  const save = () => {
    const value = parseAmount(text);
    if (value === null || (!allowNegative && value < 0)) setError(t('items.errors.amount'));
    else onSave(value);
  };

  return (
    <>
      <TextField
        label={label}
        value={text}
        onChangeText={setText}
        error={error}
        keyboardType={allowNegative ? 'numbers-and-punctuation' : 'decimal-pad'}
        emphasized
        autoFocus
      />
      <EditorActions onSave={save} onCancel={onCancel} />
    </>
  );
}

function Preferences() {
  const { t, i18n } = useTranslation();
  const palette = usePalette();
  const preferences = useAppStore((s) => s.preferences);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { reminder } = preferences;

  const languageName = (language: Language) =>
    language === 'fr' ? t('settings.french') : t('settings.english');
  const languageValue =
    preferences.language === null
      ? t('settings.automatic', { language: languageName(i18n.language === 'fr' ? 'fr' : 'en') })
      : languageName(preferences.language);

  const toggleReminder = async (enabled: boolean) => {
    if (enabled && !(await requestReminderPermission())) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    setPreferences({ reminder: { ...reminder, enabled } });
  };

  return (
    <Section title={t('settings.preferences')}>
      <Card>
        <InlineEdit
          title={t('settings.currency')}
          value={preferences.currency}
          divider
          editor={(close) => (
            <>
              <AppText weight="bold">{t('settings.currency')}</AppText>
              <Choices
                accessibilityLabel={t('settings.currency')}
                options={CURRENCIES.map((code) => ({ value: code, label: code }))}
                value={preferences.currency}
                onSelect={(currency) => {
                  setPreferences({ currency });
                  close();
                }}
              />
            </>
          )}
        />
        <InlineEdit
          title={t('settings.language')}
          value={languageValue}
          divider
          editor={(close) => (
            <>
              <AppText weight="bold">{t('settings.language')}</AppText>
              <Choices<'auto' | Language>
                accessibilityLabel={t('settings.language')}
                options={[
                  { value: 'auto', label: t('settings.automaticShort') },
                  { value: 'fr', label: t('settings.french') },
                  { value: 'en', label: t('settings.english') },
                ]}
                value={preferences.language ?? 'auto'}
                onSelect={(language) => {
                  setPreferences({ language: language === 'auto' ? null : language });
                  close();
                }}
              />
            </>
          )}
        />
        <View style={{ paddingVertical: 12, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText weight="bold">{t('settings.reminder')}</AppText>
              <AppText size={13} weight="semibold" color="textMuted">
                {remindersSupported
                  ? t('settings.reminderTime', { time: formatHour(reminder.hour) })
                  : t('settings.reminderAndroidOnly')}
              </AppText>
            </View>
            <Switch
              accessibilityLabel={t('settings.reminder')}
              disabled={!remindersSupported}
              value={remindersSupported && reminder.enabled}
              onValueChange={toggleReminder}
              trackColor={{ true: palette.accent, false: palette.inputBorder }}
              thumbColor={palette.surface}
            />
          </View>
          {permissionDenied ? (
            <AppText size={13} weight="semibold" color="negative">
              {t('settings.reminderDenied')}
            </AppText>
          ) : null}
          {remindersSupported && reminder.enabled ? (
            <Choices
              accessibilityLabel={t('settings.reminderTimeLabel')}
              options={REMINDER_HOURS.map((hour) => ({ value: hour, label: formatHour(hour) }))}
              value={reminder.hour}
              onSelect={(hour) => setPreferences({ reminder: { ...reminder, hour, minute: 0 } })}
            />
          ) : null}
        </View>
      </Card>
    </Section>
  );
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}
