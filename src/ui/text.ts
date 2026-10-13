/** "mardi 14 octobre" -> "Mardi 14 octobre" (French dates are lower case). */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
