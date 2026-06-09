import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppScaffold } from '@/components/AppScaffold';
import { ScriptToggle } from '@/components/ScriptToggle';
import { CHINESE_ENTRIES, TOPIC_GROUPS } from '@/data/chineseEntries';
import { getChinese, getChineseExample } from '@/services/script';
import { useCollection } from '@/store/collection';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { EntryTopic } from '@/types';

const TOPIC_ICONS: Record<EntryTopic, keyof typeof Ionicons.glyphMap> = {
  numbers: 'calculator',
  time: 'time',
  people: 'people',
  food: 'restaurant',
  transport: 'car',
  places: 'location',
  shopping: 'cart',
  weather: 'cloudy',
  body: 'body',
  home: 'home',
  nature: 'leaf',
  actions: 'flash',
  descriptors: 'color-palette',
  grammar: 'book',
};

const TOPIC_COLORS: Record<EntryTopic, string> = {
  numbers: '#6366F1',
  time: '#8B5CF6',
  people: '#EC4899',
  food: COLORS.koiOrange,
  transport: '#0EA5E9',
  places: '#14B8A6',
  shopping: '#F59E0B',
  weather: '#06B6D4',
  body: '#EF4444',
  home: '#84CC16',
  nature: COLORS.lotusLeafGreen,
  actions: '#F97316',
  descriptors: '#A855F7',
  grammar: '#64748B',
};

export default function WordDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isUnlocked } = useCollection();
  const { script } = usePreferences();

  const entry = useMemo(() => {
    return CHINESE_ENTRIES.find((e) => e.id === id);
  }, [id]);

  if (!entry) {
    return (
      <AppScaffold eyebrow="Not Found" title="Word not found">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
        <View style={styles.notFoundCard}>
          <Ionicons name="alert-circle" size={48} color={COLORS.textMuted} />
          <Text style={styles.notFoundText}>This word could not be found in the collection.</Text>
        </View>
      </AppScaffold>
    );
  }

  const unlocked = isUnlocked(entry.id);
  const topic = entry.topic;
  const topicIcon = TOPIC_ICONS[topic];
  const topicColor = TOPIC_COLORS[topic];
  const topicLabel = TOPIC_GROUPS.find((t) => t.id === topic)?.label || topic;
  const displayMandarin = getChinese(entry, script);
  const displayExample = getChineseExample(entry, script);

  const speakMandarin = () => {
    Speech.stop();
    Speech.speak(displayMandarin, {
      language: 'zh-CN',
      rate: 0.82,
    });
  };

  const speakExample = () => {
    if (!displayExample) return;
    Speech.stop();
    Speech.speak(displayExample, {
      language: 'zh-CN',
      rate: 0.75,
    });
  };

  if (!unlocked && entry.isChindexEntry) {
    return (
      <AppScaffold eyebrow="Locked" title="Undiscovered Word">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Back to collection</Text>
        </TouchableOpacity>
        <View style={styles.lockedCard}>
          <Ionicons name="lock-closed" size={48} color={COLORS.textMuted} />
          <Text style={styles.lockedTitle}>Word Not Yet Discovered</Text>
          <Text style={styles.lockedText}>
            Use the camera scanner to photograph real-world objects and unlock this word.
          </Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push('/capture')}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={20} color={COLORS.warmWhite} />
            <Text style={styles.scanButtonText}>Open Scanner</Text>
          </TouchableOpacity>
        </View>
      </AppScaffold>
    );
  }

  return (
    <AppScaffold
      eyebrow={topicLabel.toUpperCase()}
      title={entry.english}
      subtitle={entry.definition}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
        <Text style={styles.backText}>Back to collection</Text>
      </TouchableOpacity>

      <View style={[styles.mainCard, SHADOWS.pondTile]}>
        <View style={styles.cardHeader}>
          <View style={[styles.topicBadge, { backgroundColor: topicColor }]}>
            <Ionicons name={topicIcon} size={14} color={COLORS.warmWhite} />
            <Text style={styles.topicLabel}>{topicLabel}</Text>
          </View>
          <View style={styles.headerRight}>
            <ScriptToggle />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>HSK {entry.hskLevel}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.mandarin}>{displayMandarin}</Text>
        <Text style={styles.pinyin}>{entry.pinyin}</Text>

        <TouchableOpacity
          style={[styles.audioButton, SHADOWS.seal]}
          onPress={speakMandarin}
          activeOpacity={0.8}
        >
          <Ionicons name="volume-medium" size={22} color={COLORS.warmWhite} />
          <Text style={styles.audioButtonText}>Listen</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.definitionSection}>
          <Text style={styles.sectionLabel}>MEANING</Text>
          <Text style={styles.english}>{entry.english}</Text>
          <Text style={styles.definition}>{entry.definition}</Text>
        </View>

        {entry.example && (
          <>
            <View style={styles.divider} />
            <View style={styles.exampleSection}>
              <View style={styles.exampleHeader}>
                <Text style={styles.sectionLabel}>EXAMPLE</Text>
                <TouchableOpacity
                  style={styles.exampleAudioButton}
                  onPress={speakExample}
                  activeOpacity={0.8}
                >
                  <Ionicons name="volume-medium" size={16} color={COLORS.koiOrange} />
                </TouchableOpacity>
              </View>
              <Text style={styles.exampleMandarin}>{displayExample}</Text>
              {entry.examplePinyin && (
                <Text style={styles.examplePinyin}>{entry.examplePinyin}</Text>
              )}
              {entry.exampleEnglish && (
                <Text style={styles.exampleEnglish}>{entry.exampleEnglish}</Text>
              )}
            </View>
          </>
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Type</Text>
          <Text style={styles.metaValue}>{entry.kind}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Level</Text>
          <Text style={styles.metaValue}>HSK {entry.hskLevel}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Topic</Text>
          <Text style={styles.metaValue}>{topicLabel}</Text>
        </View>
      </View>
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
  notFoundCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    padding: SPACING.xl,
  },
  notFoundText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 15,
    textAlign: 'center',
  },
  lockedCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    padding: SPACING.xl,
  },
  lockedTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  lockedText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  scanButton: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
  },
  scanButtonText: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  mainCard: {
    backgroundColor: COLORS.surfacePondStrong,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 32,
    borderColor: 'rgba(216,182,90,0.25)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 46,
    borderWidth: 1.5,
    gap: SPACING.md,
    overflow: 'hidden',
    padding: SPACING.lg,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  topicBadge: {
    alignItems: 'center',
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topicLabel: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  levelBadge: {
    backgroundColor: 'rgba(14,90,96,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelText: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.medium,
    fontSize: 11,
    textTransform: 'capitalize',
  },
  mandarin: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 72,
    lineHeight: 86,
    textAlign: 'center',
  },
  pinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 24,
    textAlign: 'center',
  },
  audioButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.75)',
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
  },
  audioButtonText: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  divider: {
    backgroundColor: 'rgba(14,90,96,0.15)',
    height: 1,
    marginVertical: SPACING.xs,
  },
  definitionSection: {
    gap: SPACING.xs,
  },
  sectionLabel: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  english: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 26,
    textTransform: 'capitalize',
  },
  definition: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  exampleSection: {
    gap: SPACING.xs,
  },
  exampleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exampleAudioButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(217,107,43,0.15)',
    borderRadius: RADIUS.full,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  exampleMandarin: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.medium,
    fontSize: 20,
  },
  examplePinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  exampleEnglish: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    fontStyle: 'italic',
  },
  metaRow: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.md,
  },
  metaItem: {
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 14,
    textTransform: 'capitalize',
  },
});
