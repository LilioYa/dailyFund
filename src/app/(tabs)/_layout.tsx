import Feather from '@expo/vector-icons/Feather';
import { Redirect, Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { fonts, usePalette } from '@/ui/theme';
import { UndoSnackbar } from '@/ui/UndoSnackbar';

/** Tab bar height without the system navigation area. */
const TAB_BAR_HEIGHT = 72;

export default function TabsLayout() {
  const { t } = useTranslation();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const isSetUp = useAppStore((s) => s.settings !== null);

  if (!isSetUp) return <Redirect href="/setup" />;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: palette.accent,
          tabBarInactiveTintColor: palette.textMuted,
          tabBarStyle: {
            backgroundColor: palette.surface,
            borderTopColor: palette.border,
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingTop: 6,
            paddingBottom: insets.bottom + 8,
          },
          tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16 },
          sceneStyle: { backgroundColor: palette.background },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.today'),
            tabBarIcon: ({ color, size }) => <Feather name="clock" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: t('tabs.transactions'),
            tabBarIcon: ({ color, size }) => <Feather name="list" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('tabs.settings'),
            tabBarIcon: ({ color, size }) => <Feather name="sliders" color={color} size={size} />,
          }}
        />
      </Tabs>
      {/* Above the tab bar and the floating Add button */}
      <UndoSnackbar bottom={TAB_BAR_HEIGHT + insets.bottom + 92} />
    </View>
  );
}
