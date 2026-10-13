import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from './AppText';

interface Props {
  title: string;
  /** Shown at the right of the title, e.g. a total. */
  aside?: string;
  footer?: string;
  children: ReactNode;
}

/** A titled group of rows, as used in Settings, Transactions and setup. */
export function Section({ title, aside, footer, children }: Props) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <AppText size={14} weight="extrabold" color="textMuted" accessibilityRole="header">
          {title}
        </AppText>
        {aside ? (
          <AppText size={14} weight="bold" color="textMuted" tabular>
            {aside}
          </AppText>
        ) : null}
      </View>
      {children}
      {footer ? (
        <AppText size={13} color="textMuted" style={{ paddingHorizontal: 4, lineHeight: 18 }}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}
