import { View, type ViewProps } from 'react-native';

import { radius, usePalette } from './theme';

/** White rounded block grouping content, as in the mockups. */
export function Card({ style, ...props }: ViewProps) {
  const palette = usePalette();
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: palette.surface,
          borderRadius: radius.row,
          paddingHorizontal: 16,
          paddingVertical: 4,
        },
        style,
      ]}
    />
  );
}
