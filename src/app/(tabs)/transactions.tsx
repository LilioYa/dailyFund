import { router } from 'expo-router';
import { View } from 'react-native';

import type { Transaction } from '@/domain/budget';
import { addDays, localToday, type IsoDate } from '@/domain/calendar';
import { useFormatAmount, useFormatDate, useTranslation } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { AddButton } from '@/ui/AddButton';
import { AppText } from '@/ui/AppText';
import { Card } from '@/ui/Card';
import { ListRow } from '@/ui/ListRow';
import { Screen } from '@/ui/Screen';
import { Section } from '@/ui/Section';
import { capitalize, withSign } from '@/ui/text';

interface Day {
  date: IsoDate;
  transactions: Transaction[];
}

/** Transactions are stored newest first; groups consecutive ones by date. */
function groupByDay(transactions: Transaction[]): Day[] {
  const days: Day[] = [];
  for (const tx of transactions) {
    const last = days[days.length - 1];
    if (last?.date === tx.date) last.transactions.push(tx);
    else days.push({ date: tx.date, transactions: [tx] });
  }
  return days;
}

export default function TransactionsScreen() {
  const { t } = useTranslation();
  const transactions = useAppStore((s) => s.transactions);
  const days = groupByDay(transactions);

  return (
    <View style={{ flex: 1 }}>
      <Screen title={t('tabs.transactions')} bottomSpace={100}>
        {days.length === 0 ? (
          <AppText size={15} color="textMuted" style={{ paddingTop: 8, lineHeight: 22 }}>
            {t('transactions.empty')}
          </AppText>
        ) : (
          days.map((day) => <DayGroup key={day.date} day={day} />)
        )}
      </Screen>
      <AddButton />
    </View>
  );
}

function DayGroup({ day }: { day: Day }) {
  const { t } = useTranslation();
  const formatAmount = useFormatAmount();
  const formatDate = useFormatDate();
  const today = localToday();
  const title =
    day.date === today
      ? t('quickAdd.today')
      : day.date === addDays(today, -1)
        ? t('quickAdd.yesterday')
        : capitalize(formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'long' }));

  const spent = day.transactions.filter((tx) => tx.amount < 0).reduce((s, tx) => s + tx.amount, 0);
  const earned = day.transactions.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0);
  const totals = [spent && withSign(spent, formatAmount), earned && withSign(earned, formatAmount)]
    .filter(Boolean)
    .join(' · ');

  return (
    <Section title={title} aside={totals}>
      <Card>
        {day.transactions.map((tx, index) => (
          <ListRow
            key={tx.id}
            title={tx.title || t('transactions.untitled')}
            muted={!tx.title}
            value={withSign(tx.amount, formatAmount)}
            valueColor={tx.amount > 0 ? 'accent' : 'text'}
            divider={index < day.transactions.length - 1}
            onPress={() => router.push({ pathname: '/add', params: { id: tx.id } })}
          />
        ))}
      </Card>
    </Section>
  );
}
