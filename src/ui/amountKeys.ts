export const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'back'] as const;
export type Key = (typeof KEYS)[number];

/**
 * Applies a key to the amount being typed: at most 7 digits before and 2 after the comma.
 * The text always uses "," internally; screens show the locale's separator (see displayAmountText).
 */
export function applyKey(text: string, key: Key): string {
  if (key === 'back') return text.slice(0, -1);
  const [whole, decimals] = text.split(',');
  if (key === ',') return text.includes(',') ? text : `${text || '0'},`;
  if (decimals !== undefined) return decimals.length >= 2 ? text : text + key;
  if (whole === '0') return key;
  return whole.length >= 7 ? text : text + key;
}

/** The typed text with the locale's decimal separator, e.g. "12,5" -> "12.5" in English. */
export function displayAmountText(text: string, separator: string): string {
  return text.replace(',', separator);
}
