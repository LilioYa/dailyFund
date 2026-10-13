import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { usePalette } from './theme';

interface Props {
  title?: string;
  /** Shown at the right of the title. */
  aside?: string;
  children: ReactNode;
  /** Content pinned under the scroll area (e.g. a primary button). */
  footer?: ReactNode;
  /** Extra space at the bottom of the scroll area, e.g. above a floating button. */
  bottomSpace?: number;
}

/** Page frame: safe-area padding, background, scrollable content, optional title and footer. */
export function Screen({ title, aside, children, footer, bottomSpace = 24 }: Props) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
          paddingBottom: bottomSpace,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {title ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <AppText size={22} weight="extrabold" accessibilityRole="header">
              {title}
            </AppText>
            {aside ? (
              <AppText size={14} color="textMuted">
                {aside}
              </AppText>
            ) : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
      {footer ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, paddingTop: 8 }}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}
