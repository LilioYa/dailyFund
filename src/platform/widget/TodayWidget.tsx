// The widget library calls components as plain functions, outside React's renderer, so the
// React Compiler's memoization (a hook) must stay out of this file.
'use no memo';

import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import { fonts, radius, type Palette } from '@/ui/theme';

/** Deep link to the quick add sheet. */
export const ADD_URI = 'dailyfund://add';

type Hex = `#${string}`;
const hex = (color: string) => color as Hex;

export interface TodayWidgetProps {
  palette: Palette;
  /** "Left today" / "You went over by", or the setup hint before the budget exists. */
  label: string;
  /** Today's money, already formatted; null before setup. */
  amount: string | null;
  overspent: boolean;
  /** "Reserve +12.00", already formatted. */
  reserve: string | null;
  addLabel: string;
}

/**
 * Home screen widget: today's money and the reserve; the "+" opens quick add, the rest opens
 * the app. Widget primitives aren't React Native views: no hooks, every text comes in as a prop.
 */
export function TodayWidget({
  palette,
  label,
  amount,
  overspent,
  reserve,
  addLabel,
}: TodayWidgetProps) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: hex(palette.surface),
        borderRadius: radius.card,
        paddingHorizontal: 18,
        paddingVertical: 14,
      }}
    >
      <FlexWidget style={{ flex: 1, flexDirection: 'column', flexGap: 2 }}>
        <TextWidget
          text={label}
          maxLines={amount === null ? 3 : 1}
          truncate="END"
          style={{
            fontSize: 14,
            fontFamily: fonts.semibold,
            color: hex(overspent ? palette.negative : palette.textMuted),
          }}
        />
        {amount !== null ? (
          <TextWidget
            text={amount}
            maxLines={1}
            style={{
              fontSize: 30,
              fontFamily: fonts.extrabold,
              color: hex(overspent ? palette.negative : palette.text),
              adjustsFontSizeToFit: true,
            }}
          />
        ) : null}
        {reserve !== null ? (
          <TextWidget
            text={reserve}
            maxLines={1}
            truncate="END"
            style={{ fontSize: 14, fontFamily: fonts.bold, color: hex(palette.accent) }}
          />
        ) : null}
      </FlexWidget>
      {amount !== null ? (
        <FlexWidget
          clickAction="OPEN_URI"
          clickActionData={{ uri: ADD_URI }}
          accessibilityLabel={addLabel}
          style={{
            height: 52,
            width: 52,
            marginLeft: 12,
            borderRadius: 26,
            backgroundColor: hex(palette.accent),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SvgWidget svg={plusIcon(palette.onAccent)} style={{ height: 26, width: 26 }} />
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}

/** Feather's "plus", as used by the app's Add button. */
function plusIcon(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
}
