import { useTranslation } from '@/i18n';
import { Screen } from '@/ui/Screen';

export default function TransactionsScreen() {
  const { t } = useTranslation();
  return <Screen title={t('tabs.transactions')}>{null}</Screen>;
}
