import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getChinese } from '@/services/script';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { ChineseEntry, EntryTopic } from '@/types';

type ChindexCardProps = {
  entry: ChineseEntry;
  isUnlocked: boolean;
  isHighlighted?: boolean;
  onPress?: () => void;
  onUndiscover?: () => void;
};

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

export function ChindexCard({ entry, isUnlocked, isHighlighted = false, onPress, onUndiscover }: ChindexCardProps) {
  const { script } = usePreferences();
  const displayMandarin = getChinese(entry, script);
  const topic = entry.topic;
  const topicIcon = TOPIC_ICONS[topic];
  const topicColor = TOPIC_COLORS[topic];
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isHighlighted) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.5,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isHighlighted, pulseAnim, glowAnim]);

  const speakMandarin = () => {
    if (!isUnlocked) return;
    Speech.stop();
    Speech.speak(displayMandarin, {
      language: 'zh-CN',
      rate: 0.82,
    });
  };

  if (!isUnlocked) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.lockedCard, SHADOWS.seal]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.lockedContent}>
          <View style={[styles.topicBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Ionicons name={topicIcon} size={14} color="rgba(255,255,255,0.4)" />
          </View>
          <View style={styles.mysteryIcon}>
            <Ionicons name="help" size={32} color="rgba(255,255,255,0.3)" />
          </View>
          <Text style={styles.lockedText}>???</Text>
          <Text style={styles.lockedHint}>Undiscovered</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {isHighlighted && (
        <Animated.View
          style={[
            styles.highlightGlow,
            {
              opacity: glowAnim,
            },
          ]}
          pointerEvents="none"
        />
      )}
      <TouchableOpacity
        style={[
          styles.card,
          styles.unlockedCard,
          SHADOWS.seal,
          isHighlighted && styles.highlightedCard,
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={styles.unlockedContent}>
          <View style={styles.headerRow}>
            <View style={[styles.topicBadge, { backgroundColor: topicColor }]}>
              <Ionicons name={topicIcon} size={12} color={COLORS.warmWhite} />
            </View>
            <View style={styles.headerActions}>
              {onUndiscover && (
                <TouchableOpacity
                  style={styles.undiscoverButton}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onUndiscover();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.audioButton}
                onPress={(e) => {
                  e.stopPropagation?.();
                  speakMandarin();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="volume-medium" size={14} color={COLORS.warmWhite} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.mandarin} numberOfLines={1} adjustsFontSizeToFit>
            {displayMandarin}
          </Text>
          <Text style={styles.pinyin} numberOfLines={1}>
            {entry.pinyin}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.english} numberOfLines={2}>
            {entry.english}
          </Text>
          <Text style={styles.hskLevel}>HSK {entry.hskLevel}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
  },
  card: {
    borderRadius: RADIUS.md,
    minHeight: 140,
    overflow: 'hidden',
    padding: SPACING.sm,
    width: '100%',
  },
  lockedCard: {
    backgroundColor: 'rgba(8,63,69,0.6)',
    borderColor: 'rgba(127,199,194,0.15)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  unlockedCard: {
    backgroundColor: COLORS.surfacePondStrong,
    borderColor: 'rgba(216,182,90,0.25)',
    borderWidth: 1.5,
  },
  highlightedCard: {
    borderColor: COLORS.lotusGold,
    borderWidth: 2.5,
  },
  highlightGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: RADIUS.md + 4,
    backgroundColor: COLORS.lotusGold,
    shadowColor: COLORS.lotusGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  lockedContent: {
    alignItems: 'center',
    flex: 1,
    gap: SPACING.xs,
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  unlockedContent: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  topicBadge: {
    alignItems: 'center',
    borderRadius: RADIUS.full,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  undiscoverButton: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  audioButton: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderRadius: RADIUS.full,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  mysteryIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.full,
    height: 56,
    justifyContent: 'center',
    marginVertical: SPACING.xs,
    width: 56,
  },
  mandarin: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  pinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  divider: {
    backgroundColor: 'rgba(14,90,96,0.12)',
    height: 1,
    marginVertical: 4,
  },
  english: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'capitalize',
  },
  hskLevel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 10,
    marginTop: 2,
  },
  lockedText: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  lockedHint: {
    color: 'rgba(255,255,255,0.25)',
    fontFamily: FONTS.regular,
    fontSize: 11,
  },
});
