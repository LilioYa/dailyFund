import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n';

export default function Index() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text>{t('appName')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
