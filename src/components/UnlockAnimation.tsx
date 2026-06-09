import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { getChinese } from '@/services/script';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { ChineseEntry } from '@/types';

type UnlockAnimationProps = {
  entry: ChineseEntry;
  onComplete?: () => void;
};

export function UnlockAnimation({ entry, onComplete }: UnlockAnimationProps) {
  const { script } = usePreferences();
  const displayMandarin = getChinese(entry, script);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(
        50,
        sparkleAnims.map((sparkle, index) => {
          const angle = (index / 8) * Math.PI * 2;
          const distance = 80 + Math.random() * 40;

          return Animated.parallel([
            Animated.sequence([
              Animated.timing(sparkle.opacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle.opacity, {
                toValue: 0,
                duration: 400,
                delay: 200,
                useNativeDriver: true,
              }),
            ]),
            Animated.spring(sparkle.scale, {
              toValue: 1,
              tension: 150,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.translateX, {
              toValue: Math.cos(angle) * distance,
              duration: 600,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.translateY, {
              toValue: Math.sin(angle) * distance,
              duration: 600,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]);
        })
      ),
    ]).start(() => {
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    });
  }, [scaleAnim, opacityAnim, rotateAnim, sparkleAnims, onComplete]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          SHADOWS.glow,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }, { rotate }],
          },
        ]}
      >
        <View style={styles.iconRow}>
          <Ionicons name="sparkles" size={24} color={COLORS.lotusGold} />
          <Text style={styles.unlockLabel}>NEW DISCOVERY</Text>
          <Ionicons name="sparkles" size={24} color={COLORS.lotusGold} />
        </View>

        <Text style={styles.mandarin}>{displayMandarin}</Text>
        <Text style={styles.pinyin}>{entry.pinyin}</Text>

        <View style={styles.divider} />

        <Text style={styles.english}>{entry.english}</Text>
        <Text style={styles.definition}>{entry.definition}</Text>
      </Animated.View>

      {sparkleAnims.map((sparkle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.sparkle,
            {
              opacity: sparkle.opacity,
              transform: [
                { translateX: sparkle.translateX },
                { translateY: sparkle.translateY },
                { scale: sparkle.scale },
              ],
            },
          ]}
        >
          <Ionicons
            name={index % 2 === 0 ? 'star' : 'sparkles'}
            size={index % 3 === 0 ? 20 : 14}
            color={index % 2 === 0 ? COLORS.lotusGold : COLORS.koiOrange}
          />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePondStrong,
    borderColor: COLORS.lotusGold,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    gap: SPACING.sm,
    padding: SPACING.lg,
    width: 280,
  },
  iconRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  unlockLabel: {
    color: COLORS.lotusGold,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 2,
  },
  mandarin: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 48,
    lineHeight: 56,
  },
  pinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 18,
  },
  divider: {
    backgroundColor: 'rgba(14,90,96,0.15)',
    height: 1,
    marginVertical: SPACING.xs,
    width: '100%',
  },
  english: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 22,
    textTransform: 'capitalize',
  },
  definition: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
});
