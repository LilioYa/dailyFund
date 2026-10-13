import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { useCallback, useEffect } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';

import { formatMoney, type Cents } from '@/domain/money';
import { useAppStore } from '@/store/appStore';
import { en } from './en';
import { fr } from './fr';
import { formattingLocale, resolveLanguage } from './locale';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en };
  }
}

const deviceLocale = () => getLocales()[0];

const i18n = createInstance();
i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng: resolveLanguage(null, deviceLocale()),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/** Keeps i18next in sync with the language preference. Call once in the root layout. */
export function useLanguageSync(): void {
  const preferred = useAppStore((s) => s.preferences.language);
  useEffect(() => {
    i18n.changeLanguage(resolveLanguage(preferred, deviceLocale()));
  }, [preferred]);
}

/** Formats cents with the user's currency, in the app language. */
export function useFormatMoney(): (cents: Cents) => string {
  const currency = useAppStore((s) => s.preferences.currency);
  const { i18n: instance } = useTranslation();
  const locale = formattingLocale(instance.language === 'fr' ? 'fr' : 'en', deviceLocale());
  return useCallback((cents: Cents) => formatMoney(cents, currency, locale), [currency, locale]);
}

export { useTranslation };
export default i18n;
