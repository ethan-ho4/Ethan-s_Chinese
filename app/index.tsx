import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ComponentProps, useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { DailyCarousel } from '@/components/DailyCarousel';
import { DailyChineseCard } from '@/components/DailyChineseCard';
import { DailyProverbCard } from '@/components/DailyProverbCard';
import { KoiScrollScene } from '@/components/KoiScrollScene';
import { ScriptToggle } from '@/components/ScriptToggle';
import { getDailyDateLabel, getDailyEntry, getModeLabel } from '@/services/dailyEntry';
import { getDailyProverb } from '@/services/dailyProverb';
import { useCollection } from '@/store/collection';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';

type NavTarget = '/modes' | '/flashcards' | '/widget-preview' | '/chindex' | '/sentences';

type NavCardProps = {
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  index: number;
  scrollY: Animated.Value;
  title: string;
  route: NavTarget;
};

type HomeAction = Omit<NavCardProps, 'scrollY'>;

const HOME_ACTIONS: HomeAction[] = [
  {
    description: 'Photograph objects to discover and collect Chinese vocabulary.',
    icon: 'grid',
    index: 0,
    title: 'Chindex',
    route: '/chindex',
  },
  {
    description: 'Choose whether your daily Mandarin shows words, phrases, or topics.',
    icon: 'options',
    index: 1,
    title: 'Mode',
    route: '/modes',
  },
  {
    description: "Preview how today's Chinese will look in your future iOS widgets.",
    icon: 'albums',
    index: 2,
    title: 'Widgets',
    route: '/widget-preview',
  },
  {
    description: 'Review saved words and phrases with flashcards by topic.',
    icon: 'school',
    index: 3,
    title: 'Practice',
    route: '/flashcards',
  },
  {
    description: 'Drag words into order to build Mandarin sentences by HSK level.',
    icon: 'text',
    index: 4,
    title: 'Sentences',
    route: '/sentences',
  },
];

function ForegroundLotusPad() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 160 130">
      <Path
        d="M78 7 C121 5 157 31 153 69 C148 112 88 133 38 108 C-2 88 -1 39 39 15 C53 8 67 5 78 7 L85 63 L136 29 C121 14 99 7 78 7 Z"
        fill="#78B947"
        opacity={0.9}
      />
      <Path d="M85 63 C63 51 48 35 36 16" stroke={COLORS.rippleAqua} strokeWidth="3" strokeLinecap="round" opacity={0.42} />
      <Path d="M85 63 C61 73 45 89 31 108" stroke={COLORS.rippleAqua} strokeWidth="2.8" strokeLinecap="round" opacity={0.34} />
      <Path d="M85 63 C108 77 129 80 151 74" stroke={COLORS.rippleAqua} strokeWidth="2.5" strokeLinecap="round" opacity={0.32} />
      <Path d="M85 63 C78 86 79 106 86 126" stroke={COLORS.rippleAqua} strokeWidth="2.2" strokeLinecap="round" opacity={0.28} />
      <Circle cx="85" cy="63" r="5.5" fill={COLORS.lotusGold} opacity={0.6} />
    </Svg>
  );
}

function NavCard({ description, icon, index, scrollY, title, route }: NavCardProps) {
  const router = useRouter();
  const pressScale = useRef(new Animated.Value(1)).current;
  const pressOffset = useRef(new Animated.Value(0)).current;
  const rippleProgress = useRef(new Animated.Value(0)).current;
  const entryStart = 18 + index * 132;
  const entryEnd = entryStart + 76;
  const entryOpacity = scrollY.interpolate({
    inputRange: [entryStart, entryEnd],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const entryScale = scrollY.interpolate({
    inputRange: [entryStart, entryEnd],
    outputRange: [0.86, 1],
    extrapolate: 'clamp',
  });
  const entryTranslateY = scrollY.interpolate({
    inputRange: [entryStart, entryEnd],
    outputRange: [38, 0],
    extrapolate: 'clamp',
  });
  const entryTranslateX = scrollY.interpolate({
    inputRange: [entryStart, entryEnd],
    outputRange: [index % 2 === 0 ? -18 : 18, 0],
    extrapolate: 'clamp',
  });
  const glowOpacity = scrollY.interpolate({
    inputRange: [entryStart, entryEnd, entryEnd + 80],
    outputRange: [0, 0.42, 0.24],
    extrapolate: 'clamp',
  });
  const rippleOpacity = rippleProgress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.46, 0],
    extrapolate: 'clamp',
  });
  const rippleScale = rippleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1.12],
    extrapolate: 'clamp',
  });

  const animatePressIn = () => {
    rippleProgress.setValue(0);
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 0.96,
        friction: 7,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.spring(pressOffset, {
        toValue: 2,
        friction: 7,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.timing(rippleProgress, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatePressOut = () => {
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 7,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.spring(pressOffset, {
        toValue: 0,
        friction: 7,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.navCardMotion,
        {
          opacity: entryOpacity,
          transform: [
            { translateX: entryTranslateX },
            { translateY: entryTranslateY },
            { scale: entryScale },
          ],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.navPressMotion,
          {
            transform: [
              { translateY: pressOffset },
              { scale: pressScale },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.navCard}
          onPress={() => router.push(route)}
          onPressIn={animatePressIn}
          onPressOut={animatePressOut}
          activeOpacity={0.95}
          accessibilityRole="button"
          accessibilityLabel={`${title}. ${description}`}
        >
          <View pointerEvents="none" style={styles.navHighlightWash} />
          <Animated.View pointerEvents="none" style={[styles.navGlow, { opacity: glowOpacity }]} />
          <View pointerEvents="none" style={styles.navRippleOne} />
          <View pointerEvents="none" style={styles.navRippleTwo} />
          <View pointerEvents="none" style={styles.navRippleThree} />
          <View
            pointerEvents="none"
            style={[
              styles.navMotif,
              index === 0 && styles.navMotifMode,
              index === 1 && styles.navMotifWidgets,
              index === 2 && styles.navMotifPractice,
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.navPressRipple,
              {
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }],
              },
            ]}
          />
          <View style={styles.navContent}>
            <View style={styles.navIcon}>
              <View pointerEvents="none" style={styles.navIconShine} />
              <Ionicons name={icon} size={30} color={COLORS.warmWhite} />
            </View>
            <View style={styles.navTextWrap}>
              <Text style={styles.navTitle}>{title}</Text>
              <Text style={styles.navDescription}>{description}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();
  const { isLoaded, selectedMode } = usePreferences();
  const { isUnlocked, unlockEntry } = useCollection();
  const entry = useMemo(() => getDailyEntry(selectedMode), [selectedMode]);
  const proverb = useMemo(() => getDailyProverb(), []);
  const modeLabel = getModeLabel(selectedMode);
  const dateLabel = getDailyDateLabel();

  const handleDailyInteract = useCallback(async () => {
    if (entry.isChindexEntry && !isUnlocked(entry.id)) {
      await unlockEntry(entry.id);
      setTimeout(() => {
        router.push({
          pathname: '/chindex',
          params: { newlyUnlocked: entry.id },
        });
      }, 600);
    }
  }, [entry, isUnlocked, unlockEntry, router]);
  const introViewportStyle = useMemo(
    () => ({
      minHeight: Math.max(700, height - 72),
    }),
    [height],
  );
  const heroStyle = useMemo(
    () => ({
      minHeight: Math.max(332, Math.min(392, height * 0.46)),
    }),
    [height],
  );
  const cardOpacity = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [1, 0.92],
    extrapolate: 'clamp',
  });
  const cardScale = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [1, 0.96],
    extrapolate: 'clamp',
  });
  const foregroundPadOpacity = scrollY.interpolate({
    inputRange: [110, 170, 265, 340],
    outputRange: [0, 0.72, 0.52, 0],
    extrapolate: 'clamp',
  });
  const foregroundPadScale = scrollY.interpolate({
    inputRange: [110, 190, 340],
    outputRange: [0.62, 1.16, 0.82],
    extrapolate: 'clamp',
  });
  const foregroundPadTranslateX = scrollY.interpolate({
    inputRange: [110, 220, 340],
    outputRange: [-128, -28, 82],
    extrapolate: 'clamp',
  });
  const foregroundPadTranslateY = scrollY.interpolate({
    inputRange: [110, 220, 340],
    outputRange: [690, 612, 540],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[COLORS.darkJadeWater, COLORS.pondTeal, COLORS.darkJadeWater]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <KoiScrollScene scrollY={scrollY} />

      <SafeAreaView style={styles.safe}>
        <Animated.ScrollView
          contentContainerStyle={styles.content}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.introViewport, introViewportStyle]}>
            <View style={[styles.hero, heroStyle]}>
              <Text style={styles.kicker}>今日中文</Text>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Today&apos;s Mandarin</Text>
                <ScriptToggle variant="dark" />
              </View>
            </View>

            <Animated.View
              style={[
                styles.cardMotion,
                {
                  opacity: cardOpacity,
                  transform: [{ scale: cardScale }],
                },
              ]}
            >
              {!isLoaded ? (
                <View style={styles.loading}>
                  <ActivityIndicator color={COLORS.accent} />
                </View>
              ) : (
                <DailyCarousel
                  wordSlide={
                    <DailyChineseCard
                      entry={entry}
                      dateLabel={dateLabel}
                      modeLabel={modeLabel}
                      variant="compact"
                      onInteract={handleDailyInteract}
                      isChindexEntry={entry.isChindexEntry}
                      isUnlocked={isUnlocked(entry.id)}
                    />
                  }
                  proverbSlide={
                    <DailyProverbCard proverb={proverb} dateLabel={dateLabel} />
                  }
                />
              )}
            </Animated.View>
          </View>

          <View style={styles.navGrid}>
            {HOME_ACTIONS.map((action) => (
              <NavCard
                key={action.route}
                description={action.description}
                icon={action.icon}
                index={action.index}
                scrollY={scrollY}
                title={action.title}
                route={action.route}
              />
            ))}
          </View>

          <View style={styles.inkFooter}>
            <View style={styles.footerLine} />
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.foregroundPadPass,
          {
            opacity: foregroundPadOpacity,
            transform: [
              { translateX: foregroundPadTranslateX },
              { translateY: foregroundPadTranslateY },
              { rotate: '-10deg' },
              { scale: foregroundPadScale },
            ],
          },
        ]}
      >
        <ForegroundLotusPad />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 28,
  },
  introViewport: {
    justifyContent: 'flex-start',
  },
  hero: {
    justifyContent: 'flex-end',
    paddingBottom: SPACING.lg,
  },
  kicker: {
    color: COLORS.lotusGold,
    fontFamily: FONTS.bold,
    fontSize: 54,
    letterSpacing: 4,
    lineHeight: 68,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  title: {
    color: COLORS.textSecondary,
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardMotion: {
    marginBottom: 0,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    minHeight: 280,
    justifyContent: 'center',
  },
  navGrid: {
    gap: 20,
    marginBottom: SPACING.xs,
    marginTop: 0,
  },
  navCardMotion: {
    flex: 1,
  },
  navPressMotion: {
    flex: 1,
  },
  navCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePond,
    borderBottomLeftRadius: 46,
    borderBottomRightRadius: 34,
    borderColor: 'rgba(255,248,234,0.68)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 42,
    borderWidth: 1.8,
    flex: 1,
    minHeight: 126,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    ...SHADOWS.pondTile,
  },
  navContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'center',
    zIndex: 2,
  },
  navIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.75)',
    borderRadius: RADIUS.full,
    borderWidth: 2,
    height: 56,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 56,
    ...SHADOWS.seal,
  },
  navIconShine: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full,
    height: 34,
    left: 9,
    position: 'absolute',
    top: 4,
    width: 40,
  },
  navTextWrap: {
    flex: 1,
    gap: 5,
  },
  navTitle: {
    color: COLORS.mistyIvory,
    fontFamily: FONTS.medium,
    fontSize: 20,
    letterSpacing: -0.2,
  },
  navDescription: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  navHighlightWash: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    height: 190,
    left: -44,
    position: 'absolute',
    top: -58,
    transform: [{ rotate: '135deg' }],
    width: 80,
  },
  navGlow: {
    backgroundColor: 'rgba(232,176,93,0.12)',
    borderRadius: RADIUS.full,
    bottom: -18,
    height: 96,
    left: -34,
    position: 'absolute',
    width: 108,
  },
  navRippleOne: {
    borderColor: 'rgba(255,248,234,0.2)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    height: 86,
    left: -28,
    position: 'absolute',
    top: 24,
    transform: [{ rotate: '-12deg' }],
    width: 168,
  },
  navRippleTwo: {
    borderColor: 'rgba(127,199,194,0.28)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    height: 54,
    left: -24,
    position: 'absolute',
    top: 92,
    width: 112,
  },
  navRippleThree: {
    borderColor: 'rgba(216,182,90,0.26)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    bottom: -12,
    height: 52,
    position: 'absolute',
    right: -8,
    width: 88,
  },
  navMotif: {
    borderColor: 'rgba(235,239,215,0.1)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    position: 'absolute',
  },
  navMotifMode: {
    bottom: 14,
    height: 46,
    left: -18,
    transform: [{ rotate: '-8deg' }],
    width: 92,
  },
  navMotifWidgets: {
    bottom: -8,
    height: 78,
    right: -26,
    transform: [{ rotate: '18deg' }],
    width: 78,
  },
  navMotifPractice: {
    bottom: 16,
    height: 70,
    right: -20,
    transform: [{ rotate: '-28deg' }],
    width: 46,
  },
  navPressRipple: {
    borderColor: 'rgba(255,248,234,0.36)',
    borderRadius: 40,
    borderWidth: 1.2,
    bottom: 10,
    left: 10,
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  inkFooter: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
  },
  footerLine: {
    backgroundColor: 'rgba(127,199,194,0.35)',
    borderRadius: RADIUS.full,
    height: 3,
    width: 88,
  },
  foregroundPadPass: {
    height: 146,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 184,
    zIndex: 5,
  },
});
