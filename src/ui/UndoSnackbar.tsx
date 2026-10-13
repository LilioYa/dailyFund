import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useUndo } from '@/store/undo';
import { AppText } from './AppText';
import { usePalette } from './theme';

/** How long the undo offer stays on screen. */
const UNDO_MS = 6000;

/** "« Taxi » supprimé · Annuler" bar shown after a delete; mounted once in the tabs layout. */
export function UndoSnackbar({ bottom }: { bottom: number }) {
  const { t } = useTranslation();
  const palette = usePalette();
  const deleted = useUndo((s) => s.deleted);
  const clear = useUndo((s) => s.clear);
  const restoreTransaction = useAppStore((s) => s.restoreTransaction);

  useEffect(() => {
    if (!deleted) return;
    const timer = setTimeout(clear, UNDO_MS);
    return () => clearTimeout(timer);
  }, [deleted, clear]);

  if (!deleted) return null;
  return (
    <View
      accessibilityRole="alert"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom,
        minHeight: 52,
        borderRadius: 16,
        paddingLeft: 16,
        paddingRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        backgroundColor: palette.snackbar,
      }}
    >
      <AppText
        size={15}
        weight="semibold"
        numberOfLines={1}
        style={{ color: palette.onSnackbar, flexShrink: 1 }}
      >
        {deleted.title
          ? t('transactions.deleted', { title: deleted.title })
          : t('transactions.deletedUntitled')}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          restoreTransaction(deleted);
          clear();
        }}
        style={{ height: 44, paddingHorizontal: 14, justifyContent: 'center' }}
      >
        <AppText size={15} weight="extrabold" style={{ color: palette.snackbarAction }}>
          {t('common.undo')}
        </AppText>
      </Pressable>
    </View>
  );
}
