import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppScaffold } from '@/components/AppScaffold';
import { ModeOption } from '@/components/ModeOption';
import { CONTENT_MODES } from '@/data/chineseEntries';
import { filterEntriesForMode } from '@/services/dailyEntry';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SPACING } from '@/theme';
import { ModeId } from '@/types';

export default function ModesScreen() {
  const router = useRouter();
  const { isLoaded, selectedMode, setSelectedMode } = usePreferences();
  const [savingMode, setSavingMode] = useState<ModeId | null>(null);

  const handleSelectMode = async (modeId: ModeId) => {
    setSavingMode(modeId);
    try {
      await setSelectedMode(modeId);
    } finally {
      setSavingMode(null);
    }
  };

  return (
    <AppScaffold
      eyebrow="Widget Mode"
      title="Choose what your daily Chinese widget shows."
      subtitle="The selected mode controls the synced daily entry in the app now and the real iOS widget later."
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
        <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
        <Text style={styles.backText}>Back to today</Text>
      </TouchableOpacity>

      {!isLoaded ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.lotusGold} />
        </View>
      ) : (
        <View style={styles.list}>
          {CONTENT_MODES.map((mode, index) => {
            const count = filterEntriesForMode(mode.id).length;
            const isSaving = savingMode === mode.id;

            return (
              <View key={mode.id} style={styles.optionWrap}>
                <ModeOption
                  mode={mode}
                  isSelected={selectedMode === mode.id}
                  optionIndex={index}
                  optionCount={CONTENT_MODES.length}
                  onPress={() => handleSelectMode(mode.id)}
                />
                <Text style={styles.count}>
                  {isSaving ? 'Saving...' : `${count} entries in this mode`}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  loading: {
    alignItems: 'center',
    minHeight: 220,
    justifyContent: 'center',
  },
  list: {
    gap: SPACING.md,
  },
  optionWrap: {
    gap: 8,
  },
  count: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    fontSize: 13,
    paddingHorizontal: 6,
  },
});
