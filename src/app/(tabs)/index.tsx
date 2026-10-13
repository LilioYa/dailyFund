import { useTranslation } from '@/i18n';
import { Screen } from '@/ui/Screen';

export default function HomeScreen() {
  const { t } = useTranslation();
  return <Screen title={t('tabs.today')}>{null}</Screen>;
}
