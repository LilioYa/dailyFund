import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { useTranslation } from '@/i18n';
import { AppText } from './AppText';
import { usePalette } from './theme';

/** Floating "Add" button opening the quick add sheet. */
export function AddButton() {
  const { t } = useTranslation();
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('quickAdd.open')}
      onPress={() => router.push('/add')}
      style={({ pressed }) => ({
        position: 'absolute',
        right: 20,
        bottom: 20,
        height: 60,
        paddingLeft: 18,
        paddingRight: 22,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: palette.accent,
        opacity: pressed ? 0.85 : 1,
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      })}
    >
      <Feather name="plus" size={24} color={palette.onAccent} />
      <AppText size={16} weight="extrabold" style={{ color: palette.onAccent }}>
        {t('quickAdd.button')}
      </AppText>
    </Pressable>
  );
}
