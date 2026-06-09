import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getChinese } from '@/services/script';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { ChineseEntry } from '@/types';

type FlashcardProps = {
  entry: ChineseEntry;
  isRevealed: boolean;
  onToggleReveal: () => void;
};

export function Flashcard({ entry, isRevealed, onToggleReveal }: FlashcardProps) {
  const { script } = usePreferences();
  const displayMandarin = getChinese(entry, script);

  const speakMandarin = () => {
    Speech.stop();
    Speech.speak(displayMandarin, {
      language: 'zh-CN',
      rate: 0.82,
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.pondTile, styles.cardGlowBorder]}
      onPress={onToggleReveal}
      activeOpacity={0.9}
    >
      <View pointerEvents="none" style={styles.cardGlow} />
      <View pointerEvents="none" style={styles.waterLine} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.topic}>{entry.topic}</Text>
          <TouchableOpacity style={[styles.audioButton, SHADOWS.seal]} onPress={speakMandarin} activeOpacity={0.8}>
            <Ionicons name="volume-medium" size={18} color={COLORS.warmWhite} />
          </TouchableOpacity>
        </View>

        <Text style={styles.mandarin}>{displayMandarin}</Text>
        <Text style={styles.pinyin}>{entry.pinyin}</Text>

        <View style={styles.divider} />

        {isRevealed ? (
          <View style={styles.answerWrap}>
            <Text style={styles.english}>{entry.english}</Text>
            <Text style={styles.definition}>{entry.definition}</Text>
          </View>
        ) : (
          <Text style={styles.prompt}>Tap to reveal the English and definition</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfacePondStrong,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 32,
    borderColor: 'rgba(8,63,69,0.36)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 46,
    borderWidth: 1.8,
    minHeight: 360,
    overflow: 'hidden',
    padding: SPACING.lg,
  },
  cardGlowBorder: {
    shadowColor: COLORS.rippleAqua,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  content: {
    gap: SPACING.md,
    zIndex: 2,
  },
  cardGlow: {
    backgroundColor: 'rgba(232,176,93,0.1)',
    borderRadius: RADIUS.full,
    bottom: -56,
    height: 180,
    left: -48,
    position: 'absolute',
    width: 220,
  },
  waterLine: {
    borderColor: 'rgba(14,90,96,0.1)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    height: 150,
    position: 'absolute',
    right: -76,
    top: 118,
    transform: [{ rotate: '-14deg' }],
    width: 360,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topic: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.bold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  audioButton: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.75)',
    borderWidth: 1.5,
    borderRadius: RADIUS.full,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  mandarin: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 60,
    lineHeight: 74,
  },
  pinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 23,
  },
  divider: {
    backgroundColor: 'rgba(14,90,96,0.18)',
    height: 1,
    marginVertical: SPACING.sm,
  },
  answerWrap: {
    gap: SPACING.sm,
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
  prompt: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.medium,
    fontSize: 16,
    lineHeight: 24,
  },
});
