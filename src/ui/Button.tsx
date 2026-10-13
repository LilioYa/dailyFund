import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { radius, usePalette } from './theme';

interface Props extends Omit<PressableProps, 'style'> {
  label: string;
  /** primary: filled accent; soft: tinted, for secondary actions. */
  variant?: 'primary' | 'soft';
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, variant = 'primary', disabled, style, ...props }: Props) {
  const palette = usePalette();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...props}
      style={({ pressed }) => [
        {
          height: primary ? 56 : 44,
          paddingHorizontal: primary ? 24 : 18,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: primary ? palette.accent : palette.accentSoft,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <AppText
        size={primary ? 17 : 15}
        weight="extrabold"
        style={{ color: primary ? palette.onAccent : palette.onAccentSoft }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
