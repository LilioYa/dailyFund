import type { Cents } from '@/domain/money';

/** "mardi 14 octobre" -> "Mardi 14 octobre" (French dates are lower case). */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "+42,00 CHF" / "−18,20 CHF": an explicit sign on both sides (typographic minus). */
export function withSign(cents: Cents, format: (cents: Cents) => string): string {
  if (cents === 0) return format(0);
  return `${cents > 0 ? '+' : '−'}${format(Math.abs(cents))}`;
}
