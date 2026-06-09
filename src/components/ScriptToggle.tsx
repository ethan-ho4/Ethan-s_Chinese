import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS } from '@/theme';
import { ChineseScript } from '@/types';

type ScriptToggleProps = {
  variant?: 'light' | 'dark';
};

const OPTIONS: { value: ChineseScript; label: string }[] = [
  { value: 'simplified', label: '简' },
  { value: 'traditional', label: '繁' },
];

export function ScriptToggle({ variant = 'light' }: ScriptToggleProps) {
  const { script, setScript } = usePreferences();
  const isDark = variant === 'dark';

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      {OPTIONS.map((option) => {
        const active = script === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => setScript(option.value)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              option.value === 'simplified' ? 'Simplified Chinese' : 'Traditional Chinese'
            }
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                styles.optionText,
                isDark ? styles.optionTextDark : styles.optionTextLight,
                active && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 2,
  },
  containerLight: {
    backgroundColor: 'rgba(14,90,96,0.12)',
    borderColor: 'rgba(14,90,96,0.2)',
  },
  containerDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(127,199,194,0.25)',
  },
  option: {
    alignItems: 'center',
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  optionActive: {
    backgroundColor: COLORS.sealOrange,
  },
  optionText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  optionTextLight: {
    color: COLORS.textOnLightMuted,
  },
  optionTextDark: {
    color: COLORS.textSecondary,
  },
  optionTextActive: {
    color: COLORS.warmWhite,
  },
});
