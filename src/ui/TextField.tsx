import { TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './AppText';
import { fonts, radius, usePalette } from './theme';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  /** Larger bold text, for amounts. */
  emphasized?: boolean;
}

/** Labelled input as in the mockups: label above, rounded bordered field, error below. */
export function TextField({ label, error, emphasized, ...props }: Props) {
  const palette = usePalette();
  return (
    <View style={{ gap: 6 }}>
      <AppText size={13} weight="bold" color="textMuted">
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={palette.textMuted}
        {...props}
        style={{
          height: 48,
          borderWidth: 1,
          borderColor: error ? palette.negative : palette.inputBorder,
          borderRadius: radius.input,
          paddingHorizontal: 14,
          backgroundColor: palette.surface,
          color: palette.text,
          fontFamily: emphasized ? fonts.bold : fonts.medium,
          fontSize: emphasized ? 17 : 15,
        }}
      />
      {error ? (
        <AppText size={13} weight="semibold" color="negative" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
