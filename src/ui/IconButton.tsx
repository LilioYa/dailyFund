import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';

import { radius, usePalette } from './theme';

interface Props {
  icon: ComponentProps<typeof Feather>['name'];
  /** Read by screen readers: icon-only buttons need one. */
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/** 44×44 bordered square with an icon, e.g. the − / + of the day stepper. */
export function IconButton({ icon, label, onPress, disabled }: Props) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderWidth: 1,
        borderColor: palette.inputBorder,
        borderRadius: radius.input,
        backgroundColor: palette.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
      })}
    >
      <Feather name={icon} size={20} color={palette.text} />
    </Pressable>
  );
}
