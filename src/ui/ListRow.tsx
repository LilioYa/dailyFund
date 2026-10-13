import { Pressable, View } from 'react-native';

import { AppText } from './AppText';
import { usePalette, type Palette } from './theme';

interface Props {
  title: string;
  subtitle?: string;
  value?: string;
  valueColor?: keyof Palette;
  /** Draws the separator under the row (all rows of a card but the last). */
  divider?: boolean;
  /** Greyed title, e.g. for an untitled transaction. */
  muted?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

/** One line of a card: title (and subtitle) on the left, an amount or value on the right. */
export function ListRow({
  title,
  subtitle,
  value,
  valueColor = 'text',
  divider,
  muted,
  onPress,
  onLongPress,
}: Props) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress && !onLongPress}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 48,
        paddingVertical: 12,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: palette.border,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <AppText weight="bold" color={muted ? 'textMuted' : 'text'}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText size={13} weight="semibold" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText weight="extrabold" color={valueColor} tabular>
          {value}
        </AppText>
      ) : null}
    </Pressable>
  );
}
