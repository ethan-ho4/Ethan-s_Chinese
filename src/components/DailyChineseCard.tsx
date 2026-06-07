import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { ChineseEntry } from '@/types';

type DailyChineseCardProps = {
  entry: ChineseEntry;
  dateLabel: string;
  modeLabel: string;
  variant?: 'full' | 'compact';
};

export function DailyChineseCard({
  entry,
  dateLabel,
  modeLabel,
  variant = 'full',
}: DailyChineseCardProps) {
  const isCompact = variant === 'compact';
  const definition =
    isCompact && entry.definition.length > 74
      ? `${entry.definition.slice(0, 71).trim()}...`
      : entry.definition;

  const speakMandarin = () => {
    Speech.stop();
    Speech.speak(entry.mandarin, {
      language: 'zh-CN',
      rate: 0.82,
    });
  };

  return (
    <View style={[styles.card, isCompact && styles.compactCard, SHADOWS.pondTile]}>
      <View pointerEvents="none" style={styles.cardGlow} />
      <View pointerEvents="none" style={styles.cardWaterLine} />
      <View pointerEvents="none" style={styles.cardHighlight} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.date}>{dateLabel}</Text>
            <Text style={styles.mode}>{modeLabel}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{entry.kind}</Text>
          </View>
        </View>

        <Text style={[styles.mandarin, isCompact && styles.compactMandarin]}>
          {entry.mandarin}
        </Text>
        <Text style={[styles.pinyin, isCompact && styles.compactPinyin]}>{entry.pinyin}</Text>
        <Text style={[styles.english, isCompact && styles.compactEnglish]}>
          {entry.english}
        </Text>
        <Text
          style={[styles.definition, isCompact && styles.compactDefinition]}
          numberOfLines={isCompact ? 2 : undefined}
        >
          {definition}
        </Text>

        {!isCompact && entry.example ? (
          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>Example</Text>
            <Text style={styles.exampleMandarin}>{entry.example}</Text>
            <Text style={styles.examplePinyin}>{entry.examplePinyin}</Text>
            <Text style={styles.exampleEnglish}>{entry.exampleEnglish}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.speakButton, isCompact && styles.compactSpeakButton, SHADOWS.seal]}
          onPress={speakMandarin}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Hear Mandarin pronunciation"
        >
          <Ionicons name="volume-medium" size={20} color={COLORS.warmWhite} />
          {!isCompact ? <Text style={styles.speakText}>Hear pronunciation</Text> : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfacePondStrong,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 34,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 46,
    borderWidth: 2,
    borderColor: 'rgba(255,248,234,0.78)',
    overflow: 'hidden',
    padding: SPACING.lg,
    shadowColor: COLORS.lotusGold,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  compactCard: {
    padding: 22,
  },
  content: {
    gap: 12,
    zIndex: 2,
  },
  cardGlow: {
    backgroundColor: 'rgba(232,176,93,0.1)',
    borderRadius: RADIUS.full,
    bottom: -48,
    height: 170,
    left: -42,
    position: 'absolute',
    width: 210,
  },
  cardWaterLine: {
    borderColor: 'rgba(14,90,96,0.1)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    height: 150,
    left: -28,
    position: 'absolute',
    top: 178,
    transform: [{ rotate: '-10deg' }],
    width: 420,
  },
  cardHighlight: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 260,
    position: 'absolute',
    right: 24,
    top: -92,
    transform: [{ rotate: '32deg' }],
    width: 52,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  date: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  mode: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    backgroundColor: 'rgba(216,182,90,0.18)',
    borderColor: 'rgba(232,176,93,0.58)',
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.bold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  mandarin: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 56,
    lineHeight: 68,
  },
  compactMandarin: {
    fontSize: 68,
    lineHeight: 78,
  },
  pinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 22,
  },
  compactPinyin: {
    fontSize: 20,
  },
  english: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 25,
    textTransform: 'capitalize',
  },
  compactEnglish: {
    fontSize: 22,
  },
  definition: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  compactDefinition: {
    color: COLORS.textOnLightMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  exampleBox: {
    backgroundColor: 'rgba(14,90,96,0.07)',
    borderColor: 'rgba(14,90,96,0.14)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 6,
    padding: SPACING.md,
  },
  exampleLabel: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  exampleMandarin: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  examplePinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 15,
  },
  exampleEnglish: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  speakButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.75)',
    borderWidth: 1.5,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  compactSpeakButton: {
    alignSelf: 'flex-end',
    height: 46,
    justifyContent: 'center',
    paddingHorizontal: 13,
    paddingVertical: 0,
    width: 46,
  },
  speakText: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
});
