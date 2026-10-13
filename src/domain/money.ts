/** Money amount in cents (integer). Negative means money going out. */
export type Cents = number;

/**
 * Parses an amount typed by the user ("12", "12.5", "12,50", "-12.50", "+50", "4 200", "4'200")
 * into cents. Returns null if the text is not a valid amount with at most 2 decimals.
 */
export function parseAmount(text: string): Cents | null {
  // Thousands separators: spaces (incl. no-break and narrow no-break) and Swiss apostrophes
  const compact = text.replace(/[\s  '’]/g, '');
  // Sign: "+", "-" or the typographic minus U+2212
  const match = /^([+\-−]?)(\d+)(?:[.,](\d{1,2}))?$/.exec(compact);
  if (!match) return null;
  const [, sign, whole, decimals = ''] = match;
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, '0'));
  return sign === '-' || sign === '−' ? -cents : cents;
}

/** Formats cents as a localized currency amount, e.g. formatMoney(-1250, 'CHF', 'fr-CH'). */
export function formatMoney(cents: Cents, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}

function currencyParts(cents: Cents, currency: string, locale: string): Intl.NumberFormatPart[] {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(cents / 100);
}

/**
 * Formats cents like formatMoney but without the currency, e.g. "1 865.00" for CHF in fr-CH.
 * Plain number formatting can differ from the currency's (Swiss francs use "." even in French),
 * so amounts with and without the currency would not match side by side.
 */
export function formatAmount(cents: Cents, currency: string, locale: string): string {
  return currencyParts(cents, currency, locale)
    .filter((part) => part.type !== 'currency' && !(part.type === 'literal' && !part.value.trim()))
    .map((part) => part.value)
    .join('');
}

/** The decimal separator of the currency's format, e.g. "," for EUR in fr-FR, "." for CHF in fr-CH. */
export function decimalSeparator(currency: string, locale: string): string {
  const decimal = currencyParts(150, currency, locale).find((part) => part.type === 'decimal');
  return decimal?.value ?? '.';
}

/** The amount as a plain decimal string for editing, e.g. -1250 -> "-12.50". */
export function centsToInput(cents: Cents): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}
