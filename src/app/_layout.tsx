import { Stack } from 'expo-router';

import { useAdvanceOnForeground, useHydrated } from '@/store/lifecycle';

export default function RootLayout() {
  const hydrated = useHydrated();
  useAdvanceOnForeground(hydrated);

  // Render nothing until the saved data is loaded, so screens never show an empty budget
  if (!hydrated) return null;
  return <Stack />;
}
