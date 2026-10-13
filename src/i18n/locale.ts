import type { Language } from '@/store/appStore';

export const LANGUAGES: Language[] = ['fr', 'en'];

/** Currencies offered in settings (ISO 4217). */
export const CURRENCIES = ['CHF', 'EUR', 'USD', 'GBP', 'CAD'] as const;

export interface DeviceLocale {
  languageCode: string | null;
  regionCode: string | null;
}

/** The app language: the user's choice, else the device language if supported, else English. */
export function resolveLanguage(
  preferred: Language | null,
  device: DeviceLocale | undefined,
): Language {
  if (preferred) return preferred;
  return device?.languageCode === 'fr' ? 'fr' : 'en';
}

/** Locale used to format numbers: the app language with the device region (e.g. "fr-CH"). */
export function formattingLocale(language: Language, device: DeviceLocale | undefined): string {
  return device?.regionCode ? `${language}-${device.regionCode}` : language;
}
