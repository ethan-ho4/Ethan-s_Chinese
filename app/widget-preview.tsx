import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppScaffold } from '@/components/AppScaffold';
import { ProverbWidgetPreviewCard } from '@/components/ProverbWidgetPreviewCard';
import { WidgetPreviewCard } from '@/components/WidgetPreviewCard';
import { getDailyEntry, getModeLabel } from '@/services/dailyEntry';
import { getDailyProverb } from '@/services/dailyProverb';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SPACING } from '@/theme';

export default function WidgetPreviewScreen() {
  const router = useRouter();
  const { isLoaded, selectedMode } = usePreferences();
  const entry = useMemo(() => getDailyEntry(selectedMode), [selectedMode]);
  const proverb = useMemo(() => getDailyProverb(), []);
  const modeLabel = getModeLabel(selectedMode);

  return (
    <AppScaffold
      eyebrow="Widget Preview"
      title="Design the iOS widgets before native build work."
      subtitle="These previews use the same daily word, proverb, and selected mode that real iOS widgets will use later."
    >
      <View style={styles.actions}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Back to today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeButton} onPress={() => router.push('/modes')} activeOpacity={0.8}>
          <Ionicons name="options" size={18} color={COLORS.warmWhite} />
          <Text style={styles.modeButtonText}>Change mode</Text>
        </TouchableOpacity>
      </View>

      {!isLoaded ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.accent} />
        </View>
      ) : (
        <View style={styles.previewList}>
          <Text style={styles.sectionTitle}>Daily word widgets</Text>
          <WidgetPreviewCard entry={entry} modeLabel={modeLabel} size="small" />
          <WidgetPreviewCard entry={entry} modeLabel={modeLabel} size="medium" />
          <WidgetPreviewCard entry={entry} modeLabel={modeLabel} size="large" />

          <Text style={styles.sectionTitle}>Daily proverb widgets</Text>
          <ProverbWidgetPreviewCard proverb={proverb} size="small" />
          <ProverbWidgetPreviewCard proverb={proverb} size="medium" />
          <ProverbWidgetPreviewCard proverb={proverb} size="large" />
        </View>
      )}

      <View style={styles.note}>
        <Ionicons name="information-circle" size={22} color={COLORS.accent2} />
        <Text style={styles.noteText}>
          Real iOS Home Screen widgets require a WidgetKit extension and a development build.
          This Expo Go screen lets us lock the design first.
        </Text>
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  backButton: {
    alignItems: 'center',
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
  modeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.75)',
    borderWidth: 1.2,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modeButtonText: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  loading: {
    alignItems: 'center',
    minHeight: 240,
    justifyContent: 'center',
  },
  previewList: {
    gap: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginTop: SPACING.sm,
  },
  note: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.surfacePond,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 24,
    borderColor: COLORS.borderSoft,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 34,
    borderWidth: 1.2,
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  noteText: {
    color: COLORS.textSecondary,
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
  },
});
