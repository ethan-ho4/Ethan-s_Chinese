import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getProverbChinese } from '@/services/dailyProverb';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { ChineseProverb } from '@/types';

type DailyProverbCardProps = {
  proverb: ChineseProverb;
  dateLabel: string;
};

export function DailyProverbCard({ proverb, dateLabel }: DailyProverbCardProps) {
  const { script } = usePreferences();
  const displayMandarin = getProverbChinese(proverb, script);
  const english =
    proverb.english.length > 120 ? `${proverb.english.slice(0, 117).trim()}...` : proverb.english;

  const speakMandarin = () => {
    Speech.stop();
    Speech.speak(displayMandarin, {
      language: 'zh-CN',
      rate: 0.82,
    });
  };

  return (
    <View style={[styles.card, SHADOWS.pondTile]}>
      <View pointerEvents="none" style={styles.cardGlow} />
      <View pointerEvents="none" style={styles.cardWaterLine} />
      <View pointerEvents="none" style={styles.cardHighlight} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.date}>{dateLabel}</Text>
            <Text style={styles.eyebrow}>Proverb of the day</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="book" size={12} color={COLORS.koiOrange} />
            <Text style={styles.badgeText}>谚语</Text>
          </View>
        </View>

        <Text style={styles.mandarin}>{displayMandarin}</Text>
        <Text style={styles.pinyin}>{proverb.pinyin}</Text>
        <Text style={styles.english}>{english}</Text>
        {proverb.source ? <Text style={styles.source}>{proverb.source}</Text> : null}

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.speakButton, SHADOWS.seal]}
            onPress={speakMandarin}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Hear proverb pronunciation"
          >
            <Ionicons name="volume-medium" size={20} color={COLORS.warmWhite} />
          </TouchableOpacity>
        </View>
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
    padding: 22,
    minHeight: 320,
  },
  content: {
    flex: 1,
    gap: 10,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardGlow: {
    backgroundColor: 'rgba(126,159,61,0.12)',
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
  eyebrow: {
    color: COLORS.lotusLeafGreen,
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: 'rgba(126,159,61,0.15)',
    borderColor: 'rgba(126,159,61,0.45)',
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {
    color: COLORS.lotusLeafGreen,
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  mandarin: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 32,
    lineHeight: 44,
    marginTop: 4,
  },
  pinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  english: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.regular,
    fontSize: 17,
    lineHeight: 26,
    marginTop: 4,
  },
  source: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.medium,
    fontSize: 13,
    fontStyle: 'italic',
  },
  bottomRow: {
    alignItems: 'flex-start',
    marginTop: SPACING.sm,
  },
  speakButton: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderRadius: RADIUS.full,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
