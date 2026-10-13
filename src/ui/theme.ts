import { useColorScheme } from 'react-native';

/** Colors of the approved mockups (light and dark). */
const light = {
  background: '#F3F5F4',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F5F4',
  text: '#12201B',
  textMuted: '#5B6B65',
  border: '#E2E8E5',
  inputBorder: '#D5DDDA',
  accent: '#0E6B62',
  onAccent: '#FFFFFF',
  accentSoft: '#DDEFEC',
  onAccentSoft: '#0A524B',
  negative: '#B4410F',
  backdrop: 'rgba(18, 32, 27, 0.45)',
  snackbar: '#12201B',
  onSnackbar: '#FFFFFF',
  snackbarAction: '#7FD8CC',
};

export type Palette = typeof light;

const dark: Palette = {
  background: '#0D1311',
  surface: '#172220',
  surfaceMuted: '#0D1311',
  text: '#E7EEEB',
  textMuted: '#9AAAA4',
  border: '#26332F',
  inputBorder: '#3A4945',
  accent: '#4CC2B2',
  onAccent: '#06201C',
  accentSoft: '#173A35',
  onAccentSoft: '#8FE0D4',
  negative: '#F0894F',
  backdrop: 'rgba(0, 0, 0, 0.6)',
  snackbar: '#E7EEEB',
  onSnackbar: '#12201B',
  snackbarAction: '#0E6B62',
};

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Manrope weights loaded in the root layout; React Native needs one family per weight. */
export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

export type FontWeight = keyof typeof fonts;

export const radius = { input: 12, segment: 14, row: 20, card: 24, pill: 999 } as const;
