import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { useCallback, useEffect } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';

import type { IsoDate } from '@/domain/calendar';
import { formatAmount, formatMoney, type Cents } from '@/domain/money';
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

/** Locale for numbers and dates: the app language with the device region. */
function useFormattingLocale(): string {
  const { i18n: instance } = useTranslation();
  return formattingLocale(instance.language === 'fr' ? 'fr' : 'en', deviceLocale());
}

/** Formats cents with the user's currency, in the app language. */
export function useFormatMoney(): (cents: Cents) => string {
  const currency = useAppStore((s) => s.preferences.currency);
  const locale = useFormattingLocale();
  return useCallback((cents: Cents) => formatMoney(cents, currency, locale), [currency, locale]);
}

/** Formats cents as a number without currency, for lists (e.g. "1 865,00"). */
export function useFormatAmount(): (cents: Cents) => string {
  const locale = useFormattingLocale();
  return useCallback((cents: Cents) => formatAmount(cents, locale), [locale]);
}

/** Formats an ISO date in the app language, e.g. { day: 'numeric', month: 'long' } -> "25 octobre". */
export function useFormatDate(): (date: IsoDate, options: Intl.DateTimeFormatOptions) => string {
  const locale = useFormattingLocale();
  return useCallback(
    (date: IsoDate, options: Intl.DateTimeFormatOptions) => {
      const [year, month, day] = date.split('-').map(Number);
      // UTC on both sides so the device time zone can never shift the day
      return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(
        Date.UTC(year, month - 1, day),
      );
    },
    [locale],
  );
}

/** "Day 12 of the month" / "Le 12 du mois", with the French ordinal for the 1st ("Le 1er"). */
export function useDayOfMonth(): (day: number) => string {
  const { t } = useTranslation();
  return useCallback(
    (day: number) => t('items.dayOfMonth', { day, context: day === 1 ? 'first' : undefined }),
    [t],
  );
}

export { useTranslation };
export default i18n;
