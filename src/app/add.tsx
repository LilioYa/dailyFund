import Feather from '@expo/vector-icons/Feather';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  applyTransaction,
  revertTransaction,
  type BudgetState,
  type Transaction,
} from '@/domain/budget';
import { addDays, localToday, type IsoDate } from '@/domain/calendar';
import { centsToInput, parseAmount, type Cents } from '@/domain/money';
import { useFormatDate, useFormatMoney, useTranslation } from '@/i18n';
import { useAppStore, type TransactionInput } from '@/store/appStore';
import { useUndo } from '@/store/undo';
import { applyKey, type Key } from '@/ui/amountKeys';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Choices } from '@/ui/Choices';
import { Keypad } from '@/ui/Keypad';
import { Segmented } from '@/ui/Segmented';
import { capitalize } from '@/ui/text';
import { fonts, radius, usePalette } from '@/ui/theme';

type Kind = 'expense' | 'income';

/** Days offered in the date picker: today and the 6 days before. */
const PICKABLE_DAYS = 7;

/** Bottom sheet to add a transaction, or edit one when opened with ?id=. */
export default function AddScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useTranslation();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const budget = useAppStore((s) => s.budget);
  const existing = useAppStore((s) => s.transactions.find((tx) => tx.id === id));
  const addTransaction = useAppStore((s) => s.addTransaction);
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);
  const offerUndo = useUndo((s) => s.offer);

  const [kind, setKind] = useState<Kind>(existing && existing.amount > 0 ? 'income' : 'expense');
  const [amountText, setAmountText] = useState(
    existing ? centsToInput(Math.abs(existing.amount)).replace('.', ',') : '',
  );
  const [title, setTitle] = useState(existing?.title ?? '');
  const [date, setDate] = useState<IsoDate>(existing?.date ?? localToday());
  const [pickingDate, setPickingDate] = useState(false);
  const [error, setError] = useState<string>();
  const dayLabel = useDayLabel();

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  if (!budget) return null;

  const magnitude = parseAmount(amountText) ?? 0;
  const amount: Cents = kind === 'expense' ? -magnitude : magnitude;
  const input: TransactionInput = { title: title.trim(), amount, date };

  const save = () => {
    const result = existing ? updateTransaction(existing.id, input) : addTransaction(input);
    if (result.ok) close();
    else setError(t(`transactionErrors.${result.error}`));
  };

  const remove = () => {
    if (!existing) return;
    const deleted = deleteTransaction(existing.id);
    if (deleted) offerUndo(deleted);
    close();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: palette.backdrop }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={close}
        style={{ flex: 1 }}
      />
      <ScrollView
        style={{ flexGrow: 0, maxHeight: '92%' }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          backgroundColor: palette.surface,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingTop: 12,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          gap: 16,
        }}
      >
        <View
          style={{
            width: 40,
            height: 5,
            borderRadius: 3,
            backgroundColor: palette.inputBorder,
            alignSelf: 'center',
          }}
        />
        <Segmented<Kind>
          accessibilityLabel={t('quickAdd.kind')}
          options={[
            { value: 'expense', label: t('quickAdd.expense') },
            { value: 'income', label: t('quickAdd.income') },
          ]}
          value={kind}
          onChange={(value) => {
            setKind(value);
            setError(undefined);
          }}
        />

        <View style={{ alignItems: 'center', gap: 4, paddingVertical: 8 }}>
          <AmountDisplay text={amountText} kind={kind} />
          <AppText size={14} color="textMuted" accessibilityLiveRegion="polite">
            {error ??
              (magnitude > 0 ? <Preview budget={budget} tx={existing} input={input} /> : ' ')}
          </AppText>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <AppText size={13} weight="bold" color="textMuted">
              {t('quickAdd.what')}
            </AppText>
            <TextInput
              accessibilityLabel={t('quickAdd.what')}
              value={title}
              onChangeText={setTitle}
              placeholder={t('quickAdd.whatPlaceholder')}
              placeholderTextColor={palette.textMuted}
              style={{
                height: 44,
                borderWidth: 1,
                borderColor: palette.inputBorder,
                borderRadius: radius.input,
                paddingHorizontal: 12,
                color: palette.text,
                fontFamily: fonts.medium,
                fontSize: 15,
              }}
            />
          </View>
          <View style={{ width: 140, gap: 4 }}>
            <AppText size={13} weight="bold" color="textMuted">
              {t('quickAdd.when')}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('quickAdd.when')} ${dayLabel(date)}`}
              accessibilityState={{ expanded: pickingDate }}
              onPress={() => setPickingDate(!pickingDate)}
              style={{
                height: 44,
                borderWidth: 1,
                borderColor: palette.inputBorder,
                borderRadius: radius.input,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <DayLabel date={date} />
              <Feather
                name={pickingDate ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={palette.text}
              />
            </Pressable>
          </View>
        </View>

        {pickingDate ? (
          <DayChoices
            selected={date}
            onSelect={(day) => {
              setDate(day);
              setPickingDate(false);
              setError(undefined);
            }}
          />
        ) : (
          <Keypad
            onKey={(key: Key) => {
              setAmountText(applyKey(amountText, key));
              setError(undefined);
            }}
          />
        )}

        <Button
          label={
            existing
              ? t('common.save')
              : kind === 'expense'
                ? t('quickAdd.addExpense')
                : t('quickAdd.addIncome')
          }
          disabled={magnitude === 0}
          onPress={save}
        />
        {existing ? (
          <Pressable
            accessibilityRole="button"
            onPress={remove}
            style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <AppText size={15} weight="extrabold" color="negative">
              {t('transactions.delete')}
            </AppText>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

function AmountDisplay({ text, kind }: { text: string; kind: Kind }) {
  const currency = useAppStore((s) => s.preferences.currency);
  const sign = kind === 'expense' ? '−' : '+';
  return (
    <AppText
      size={44}
      weight="extrabold"
      color={kind === 'income' ? 'accent' : 'text'}
      tabular
      adjustsFontSizeToFit
      numberOfLines={1}
      style={{ letterSpacing: -1 }}
    >
      {`${sign}${text || '0'} `}
      <AppText size={22} weight="bold" color="textMuted">
        {currency}
      </AppText>
    </AppText>
  );
}

/** What the transaction will change, computed with the budget rules. */
function Preview({
  budget,
  tx,
  input,
}: {
  budget: BudgetState;
  tx: Transaction | undefined;
  input: TransactionInput;
}) {
  const { t } = useTranslation();
  const formatMoney = useFormatMoney();
  if (input.date > budget.currentDay) return t('transactionErrors.future-date');

  const base = tx ? revertTransaction(budget, tx) : budget;
  const next = applyTransaction(base, { ...input, id: tx?.id ?? 'preview' });
  if (input.amount > 0) {
    return t('quickAdd.toReserve', { total: formatMoney(next.balance) });
  }
  if (input.date === budget.currentDay) {
    return next.todayLeft >= 0
      ? t('quickAdd.leftAfter', { amount: formatMoney(next.todayLeft) })
      : t('quickAdd.overAfter', { amount: formatMoney(-next.todayLeft) });
  }
  return t('quickAdd.fromReserve', { total: formatMoney(next.balance) });
}

/** "Aujourd'hui", "Hier", else "Lundi 13". */
function useDayLabel(): (date: IsoDate) => string {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  return (date) => {
    const today = localToday();
    if (date === today) return t('quickAdd.today');
    if (date === addDays(today, -1)) return t('quickAdd.yesterday');
    return capitalize(formatDate(date, { weekday: 'long', day: 'numeric' }));
  };
}

function DayLabel({ date }: { date: IsoDate }) {
  return (
    <AppText size={15} weight="bold" numberOfLines={1} style={{ flexShrink: 1 }}>
      {useDayLabel()(date)}
    </AppText>
  );
}

function DayChoices({
  selected,
  onSelect,
}: {
  selected: IsoDate;
  onSelect: (date: IsoDate) => void;
}) {
  const { t } = useTranslation();
  const dayLabel = useDayLabel();
  const today = localToday();
  const days = Array.from({ length: PICKABLE_DAYS }, (_, i) => addDays(today, -i));
  return (
    <Choices
      accessibilityLabel={t('quickAdd.when')}
      options={days.map((day) => ({ value: day, label: dayLabel(day) }))}
      value={selected}
      onSelect={onSelect}
    />
  );
}
