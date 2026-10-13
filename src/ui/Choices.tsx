import { Pressable, View } from 'react-native';

import { AppText } from './AppText';
import { radius, usePalette } from './theme';

interface Props<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onSelect: (value: T) => void;
  accessibilityLabel: string;
}

/** Wrapping row of pill-shaped choices, the selected one filled. */
export function Choices<T extends string | number>({
  options,
  value,
  onSelect,
  accessibilityLabel,
}: Props<T>) {
  const palette = usePalette();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(option.value)}
            style={{
              minHeight: 44,
              paddingHorizontal: 14,
              borderRadius: radius.pill,
              justifyContent: 'center',
              backgroundColor: selected ? palette.accent : palette.surfaceMuted,
            }}
          >
            <AppText
              size={15}
              weight="bold"
              style={{ color: selected ? palette.onAccent : palette.text }}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
