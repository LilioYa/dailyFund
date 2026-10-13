import { Text, type TextProps } from 'react-native';

import { fonts, usePalette, type FontWeight, type Palette } from './theme';

interface Props extends TextProps {
  size?: number;
  weight?: FontWeight;
  color?: keyof Palette;
  /** Equal-width digits, for amounts in columns. */
  tabular?: boolean;
}

export function AppText({
  size = 16,
  weight = 'medium',
  color = 'text',
  tabular = false,
  style,
  ...props
}: Props) {
  const palette = usePalette();
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts[weight],
          fontSize: size,
          color: palette[color],
          fontVariant: tabular ? ['tabular-nums'] : undefined,
        },
        style,
      ]}
    />
  );
}
