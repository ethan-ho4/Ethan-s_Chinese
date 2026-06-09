import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

import { PreferencesProvider } from '@/store/preferences';
import { COLORS } from '@/theme';

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.bg },
            animation: 'slide_from_right',
          }}
        />
      </View>
    </PreferencesProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
