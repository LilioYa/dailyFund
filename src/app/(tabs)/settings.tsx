import { useTranslation } from '@/i18n';
import { Screen } from '@/ui/Screen';

export default function SettingsScreen() {
  const { t } = useTranslation();
  return <Screen title={t('tabs.settings')}>{null}</Screen>;
}
