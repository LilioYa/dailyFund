import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { KEYS, type Key } from './amountKeys';
import { AppText } from './AppText';
import { usePalette } from './theme';

/** Number pad for amounts, so entry never depends on the system keyboard layout. */
export function Keypad({ onKey }: { onKey: (key: Key) => void }) {
  const { t } = useTranslation();
  const palette = usePalette();
  return (
    <View
      accessibilityLabel={t('quickAdd.keypad')}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
    >
      {KEYS.map((key) => (
        <Pressable
          key={key}
          accessibilityRole="button"
          accessibilityLabel={key === 'back' ? t('quickAdd.erase') : key}
          onPress={() => onKey(key)}
          style={({ pressed }) => ({
            // Three keys per row: (100% - 2 gaps) / 3
            width: '31.6%',
            flexGrow: 1,
            height: 52,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? palette.border : palette.surfaceMuted,
          })}
        >
          {key === 'back' ? (
            <Feather name="delete" size={24} color={palette.text} />
          ) : (
            <AppText size={22} weight="bold">
              {key}
            </AppText>
          )}
        </Pressable>
      ))}
    </View>
  );
}
