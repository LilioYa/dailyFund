import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { dayRecordDiff, spread, type BudgetState, type DayRecord } from '@/domain/budget';
import { daysUntilPayday } from '@/domain/calendar';
import type { Cents } from '@/domain/money';
import { useFormatAmount, useFormatDate, useFormatMoney, useTranslation } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { AddButton } from '@/ui/AddButton';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Screen } from '@/ui/Screen';
import { capitalize } from '@/ui/text';
import { radius, usePalette } from '@/ui/theme';

/** How many closed days the home screen lists. */
const RECENT_DAYS = 7;

export default function HomeScreen() {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const budget = useAppStore((s) => s.budget);
  const payDay = useAppStore((s) => s.settings?.mainIncome.day);

  // The tabs layout redirects to setup before this can happen
  if (!budget || payDay === undefined) return null;

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title={t('tabs.today')}
        aside={capitalize(
          formatDate(budget.currentDay, { weekday: 'long', day: 'numeric', month: 'long' }),
        )}
        bottomSpace={100}
      >
        <TodayCard budget={budget} payDay={payDay} />
        <ReserveCard budget={budget} payDay={payDay} />
        <RecentDays history={budget.history} />
      </Screen>
      <AddButton />
    </View>
  );
}

function TodayCard({ budget, payDay }: { budget: BudgetState; payDay: number }) {
  const { t } = useTranslation();
  const palette = usePalette();
  const formatMoney = useFormatMoney();
  const formatAmount = useFormatAmount();
  const spent = budget.todayBudget - budget.todayLeft;
  const overspent = budget.todayLeft < 0;
  const progress =
    budget.todayBudget > 0 ? Math.min(Math.max(spent / budget.todayBudget, 0), 1) : 1;
  const spentLabel = t('home.spentOf', {
    spent: formatAmount(spent),
    budget: formatAmount(budget.todayBudget),
  });

  return (
    <Card style={{ borderRadius: radius.card, padding: 24, gap: 14 }}>
      <AppText size={15} weight="semibold" color="textMuted">
        {overspent ? t('home.overspent') : t('home.leftToday')}
      </AppText>
      <AppText
        size={48}
        weight="extrabold"
        color={overspent ? 'negative' : 'text'}
        tabular
        adjustsFontSizeToFit
        numberOfLines={1}
        style={{ lineHeight: 56, letterSpacing: -1.5 }}
      >
        {formatMoney(Math.abs(budget.todayLeft))}
      </AppText>
      <View
        accessible
        accessibilityLabel={spentLabel}
        style={{
          height: 10,
          borderRadius: 5,
          backgroundColor: palette.border,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            borderRadius: 5,
            backgroundColor: overspent ? palette.negative : palette.accent,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <AppText size={14} color="textMuted" tabular style={{ flexShrink: 1 }}>
          {spentLabel}
        </AppText>
        <AppText size={14} color="textMuted">
          {t('home.payIn', { count: daysUntilPayday(budget.currentDay, payDay) })}
        </AppText>
      </View>
    </Card>
  );
}

function ReserveCard({ budget, payDay }: { budget: BudgetState; payDay: number }) {
  const { t } = useTranslation();
  const formatMoney = useFormatMoney();
  const spreadReserve = useAppStore((s) => s.spread);
  const perDayChange = spread(budget, payDay).perDay - budget.perDay;

  return (
    <Card
      style={{
        padding: 16,
        paddingLeft: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <AppText size={14} weight="semibold" color="textMuted">
          {t('home.reserve')}
        </AppText>
        <AppText
          size={24}
          weight="extrabold"
          color={budget.balance < 0 ? 'negative' : 'accent'}
          tabular
        >
          {signed(budget.balance, formatMoney)}
        </AppText>
        {budget.balance !== 0 ? (
          <AppText size={13} color="textMuted">
            {t('home.spreadHint', { amount: signed(perDayChange, formatMoney) })}
          </AppText>
        ) : null}
      </View>
      <Button
        label={t('home.spread')}
        variant="soft"
        disabled={budget.balance === 0}
        onPress={spreadReserve}
      />
    </Card>
  );
}

function RecentDays({ history }: { history: DayRecord[] }) {
  const { t } = useTranslation();
  const palette = usePalette();
  const formatAmount = useFormatAmount();
  const formatDate = useFormatDate();
  const recent = history.slice(-RECENT_DAYS).reverse();

  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingHorizontal: 4,
          paddingVertical: 4,
        }}
      >
        <AppText size={17} weight="extrabold" accessibilityRole="header">
          {t('home.recentDays')}
        </AppText>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.navigate('/transactions')}
          hitSlop={12}
        >
          <AppText size={14} weight="bold" style={{ color: palette.accent }}>
            {t('home.seeAll')}
          </AppText>
        </Pressable>
      </View>
      <Card>
        {recent.length === 0 ? (
          <AppText size={14} color="textMuted" style={{ paddingVertical: 14 }}>
            {t('home.noHistory')}
          </AppText>
        ) : (
          recent.map((record, index) => {
            const diff = dayRecordDiff(record);
            return (
              <View
                key={record.date}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  borderBottomWidth: index < recent.length - 1 ? 1 : 0,
                  borderBottomColor: palette.border,
                }}
              >
                <AppText size={15} weight="semibold" style={{ flex: 1 }}>
                  {capitalize(formatDate(record.date, { weekday: 'long', day: 'numeric' }))}
                </AppText>
                <AppText size={13} color="textMuted" tabular>
                  {`${formatAmount(record.spent)} / ${formatAmount(record.budget)}`}
                </AppText>
                <AppText
                  size={15}
                  weight="extrabold"
                  color={diff < 0 ? 'negative' : 'accent'}
                  tabular
                  style={{ minWidth: 88, textAlign: 'right' }}
                  accessibilityLabel={t(diff < 0 ? 'home.dayOver' : 'home.dayUnder', {
                    amount: formatAmount(Math.abs(diff)),
                  })}
                >
                  {`${diff < 0 ? '▼' : '▲'} ${formatAmount(Math.abs(diff))}`}
                </AppText>
              </View>
            );
          })
        )}
      </Card>
    </View>
  );
}

/** "+42,00 CHF" / "−18,20 CHF": an explicit sign on both sides. */
function signed(cents: Cents, format: (cents: Cents) => string): string {
  if (cents === 0) return format(0);
  return `${cents > 0 ? '+' : '−'}${format(Math.abs(cents))}`;
}
