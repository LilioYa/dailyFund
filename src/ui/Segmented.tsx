import { Pressable, View } from 'react-native';

import { AppText } from './AppText';
import { radius, usePalette } from './theme';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

/** Mutually exclusive choices side by side, e.g. Expense / Income. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: Props<T>) {
  const palette = usePalette();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        gap: 4,
        padding: 4,
        borderRadius: radius.segment,
        backgroundColor: palette.surfaceMuted,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 11,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? palette.surface : 'transparent',
            }}
          >
            <AppText
              size={15}
              weight={selected ? 'extrabold' : 'bold'}
              color={selected ? 'text' : 'textMuted'}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
