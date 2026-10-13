import Feather from '@expo/vector-icons/Feather';
import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { centsToInput, parseAmount, type Cents } from '@/domain/money';
import { useDayOfMonth, useFormatAmount, useTranslation } from '@/i18n';
import { newId } from '@/store/ids';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';
import { DayStepper } from './DayStepper';
import { ListRow } from './ListRow';
import { TextField } from './TextField';
import { usePalette } from './theme';

/** A named amount, with a day of month for recurring incomes. */
export interface Item {
  id: string;
  name: string;
  amount: Cents;
  day?: number;
}

interface Props<T extends Item> {
  items: T[];
  onChange: (items: T[]) => void;
  /** Recurring incomes have a day of month; fixed charges don't. */
  withDay: boolean;
  addLabel: string;
  /** Rendered first inside the same card, e.g. the main income above other incomes. */
  leading?: ReactNode;
}

type Editing = { id: string | null; name: string; amount: string; day: number };

/** List of named amounts edited in place: tap a row to edit or delete it, "+" to add one. */
export function EditableItems<T extends Item>({
  items,
  onChange,
  withDay,
  addLabel,
  leading,
}: Props<T>) {
  const { t } = useTranslation();
  const formatAmount = useFormatAmount();
  const dayOfMonth = useDayOfMonth();
  const palette = usePalette();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  const startEdit = (item: T | null) => {
    setErrors({});
    setEditing(
      item
        ? { id: item.id, name: item.name, amount: centsToInput(item.amount), day: item.day ?? 1 }
        : { id: null, name: '', amount: '', day: 1 },
    );
  };

  const save = () => {
    if (!editing) return;
    const amount = parseAmount(editing.amount);
    const nextErrors = {
      name: editing.name.trim() ? undefined : t('items.errors.name'),
      amount: amount !== null && amount > 0 ? undefined : t('items.errors.amount'),
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.amount || amount === null) return;

    const saved = {
      id: editing.id ?? newId(),
      name: editing.name.trim(),
      amount,
      ...(withDay ? { day: editing.day } : {}),
    } as T;
    onChange(
      editing.id ? items.map((item) => (item.id === editing.id ? saved : item)) : [...items, saved],
    );
    setEditing(null);
  };

  const remove = () => {
    if (!editing?.id) return;
    onChange(items.filter((item) => item.id !== editing.id));
    setEditing(null);
  };

  const editor = editing ? (
    <View style={{ gap: 12, paddingVertical: 12 }}>
      <TextField
        label={t('items.name')}
        value={editing.name}
        onChangeText={(name) => setEditing({ ...editing, name })}
        error={errors.name}
        autoFocus
      />
      <TextField
        label={t('items.amount')}
        value={editing.amount}
        onChangeText={(amount) => setEditing({ ...editing, amount })}
        error={errors.amount}
        keyboardType="decimal-pad"
        emphasized
      />
      {withDay ? (
        <DayStepper
          label={t('items.day')}
          value={editing.day}
          onChange={(day) => setEditing({ ...editing, day })}
        />
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Button label={t('common.save')} variant="soft" onPress={save} />
        <Button label={t('common.cancel')} variant="soft" onPress={() => setEditing(null)} />
        {editing.id ? <Button label={t('common.delete')} variant="soft" onPress={remove} /> : null}
      </View>
    </View>
  ) : null;

  return (
    <Card>
      {leading}
      {items.map((item) =>
        editing?.id === item.id ? (
          <View key={item.id} style={{ borderBottomWidth: 1, borderBottomColor: palette.border }}>
            {editor}
          </View>
        ) : (
          <ListRow
            key={item.id}
            title={item.name}
            subtitle={withDay && item.day ? dayOfMonth(item.day) : undefined}
            value={formatAmount(item.amount)}
            onPress={() => startEdit(item)}
            divider
          />
        ),
      )}
      {editing && editing.id === null ? (
        editor
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => startEdit(null)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            minHeight: 48,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Feather name="plus" size={20} color={palette.accent} />
          <AppText size={15} weight="extrabold" style={{ color: palette.accent }}>
            {addLabel}
          </AppText>
        </Pressable>
      )}
    </Card>
  );
}
