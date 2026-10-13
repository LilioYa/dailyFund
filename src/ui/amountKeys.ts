export const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'back'] as const;
export type Key = (typeof KEYS)[number];

/** Applies a key to the amount being typed: at most 7 digits before and 2 after the comma. */
export function applyKey(text: string, key: Key): string {
  if (key === 'back') return text.slice(0, -1);
  const [whole, decimals] = text.split(',');
  if (key === ',') return text.includes(',') ? text : `${text || '0'},`;
  if (decimals !== undefined) return decimals.length >= 2 ? text : text + key;
  if (whole === '0') return key;
  return whole.length >= 7 ? text : text + key;
}
