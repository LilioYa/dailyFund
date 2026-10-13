import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useLanguageSync } from '@/i18n';
import { useReminderSync } from '@/platform/useReminderSync';
import { useWidgetSync } from '@/platform/widget/useWidgetSync';
import { useAdvanceOnForeground, useHydrated } from '@/store/lifecycle';
import { usePalette } from '@/ui/theme';

export const unstable_settings = {
  // Opening quick add from the widget (dailyfund://add) keeps the tabs underneath
  anchor: '(tabs)',
};

export default function RootLayout() {
  const hydrated = useHydrated();
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const palette = usePalette();
  useAdvanceOnForeground(hydrated);
  useLanguageSync();
  useReminderSync(hydrated);
  useWidgetSync(hydrated);

  // Render nothing until data and fonts are loaded, so screens never flash an empty budget
  if (!hydrated || !fontsLoaded) return null;
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        {/* Bottom sheet drawn by the screen itself over a dimmed backdrop */}
        <Stack.Screen
          name="add"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
    </>
  );
}
