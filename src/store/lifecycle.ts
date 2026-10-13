import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { useAppStore } from './appStore';

/** True once the saved data has been loaded from storage. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAppStore.persist.onFinishHydration(onChange),
    () => useAppStore.persist.hasHydrated(),
    // Static web rendering happens at build time, without storage
    () => false,
  );
}

/** Resolves once the saved data has been loaded, for code outside React (the widget task). */
export function whenHydrated(): Promise<void> {
  if (useAppStore.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = useAppStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

/** Closes elapsed days once loaded, and again each time the app comes back to the foreground. */
export function useAdvanceOnForeground(hydrated: boolean): void {
  useEffect(() => {
    if (!hydrated) return;
    const { advanceToToday } = useAppStore.getState();
    advanceToToday();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') advanceToToday();
    });
    return () => subscription.remove();
  }, [hydrated]);
}
