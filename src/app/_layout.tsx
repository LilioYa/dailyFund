import { Stack } from 'expo-router';

import { useLanguageSync } from '@/i18n';
import { useAdvanceOnForeground, useHydrated } from '@/store/lifecycle';

export default function RootLayout() {
  const hydrated = useHydrated();
  useAdvanceOnForeground(hydrated);
  useLanguageSync();

  // Render nothing until the saved data is loaded, so screens never show an empty budget
  if (!hydrated) return null;
  return <Stack />;
}
