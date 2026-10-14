import { Redirect, Stack } from 'expo-router';

import { useAppStore } from '@/store/appStore';

export default function SetupLayout() {
  const isSetUp = useAppStore((s) => s.settings !== null);
  // Setup runs once; afterwards everything is changed from Settings
  if (isSetUp) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
