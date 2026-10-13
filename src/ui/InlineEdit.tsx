import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { useTranslation } from '@/i18n';
import { Button } from './Button';
import { ListRow } from './ListRow';
import { usePalette } from './theme';

interface Props {
  title: string;
  subtitle?: string;
  value: string;
  divider?: boolean;
  /** Renders the editor; `close` collapses it again (after saving or cancelling). */
  editor: (close: () => void) => ReactNode;
}

/** A settings row that expands in place into an editor when tapped. */
export function InlineEdit({ title, subtitle, value, divider, editor }: Props) {
  const palette = usePalette();
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <ListRow
        title={title}
        subtitle={subtitle}
        value={value}
        divider={divider}
        onPress={() => setOpen(true)}
      />
    );
  }
  return (
    <View
      style={{
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: palette.border,
      }}
    >
      {editor(() => setOpen(false))}
    </View>
  );
}

/** Save / Cancel buttons used at the bottom of every inline editor. */
export function EditorActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      <Button label={t('common.save')} variant="soft" onPress={onSave} />
      <Button label={t('common.cancel')} variant="soft" onPress={onCancel} />
    </View>
  );
}
