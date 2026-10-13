/** Money amount in cents (integer). Negative means money going out. */
export type Cents = number;

/**
 * Parses an amount typed by the user ("12", "12.5", "12,50", "-12.50", "+50") into cents.
 * Returns null if the text is not a valid amount with at most 2 decimals.
 */
export function parseAmount(text: string): Cents | null {
  const match = /^([+-]?)(\d+)(?:[.,](\d{1,2}))?$/.exec(text.trim());
  if (!match) return null;
  const [, sign, whole, decimals = ''] = match;
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, '0'));
  return sign === '-' ? -cents : cents;
}

/** Formats cents as a localized currency amount, e.g. formatMoney(-1250, 'CHF', 'fr-CH'). */
export function formatMoney(cents: Cents, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}

/** The amount as a plain decimal string for editing, e.g. -1250 -> "-12.50". */
export function centsToInput(cents: Cents): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}
