import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, RefObject, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KoiScrollScene } from '@/components/KoiScrollScene';
import { COLORS, FONTS, SHADOWS, SPACING } from '@/theme';

type AppScaffoldProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  scrollViewRef?: RefObject<ScrollView>;
}>;

export function AppScaffold({ children, eyebrow, title, subtitle, scrollViewRef }: AppScaffoldProps) {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[COLORS.darkJadeWater, COLORS.pondTeal, COLORS.darkJadeWater]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <KoiScrollScene scrollY={scrollY} variant="subtle" />
      <SafeAreaView style={styles.safe}>
        <Animated.ScrollView
          ref={scrollViewRef as RefObject<Animated.ScrollView>}
          contentContainerStyle={styles.content}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {children}
        </Animated.ScrollView>
      </SafeAreaView>
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
    paddingBottom: 48,
    gap: SPACING.lg,
  },
  header: {
    backgroundColor: 'rgba(220,224,199,0.12)',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 28,
    borderColor: 'rgba(235,239,215,0.22)',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 40,
    borderWidth: 1,
    gap: SPACING.sm,
    overflow: 'hidden',
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    ...SHADOWS.pondTile,
  },
  eyebrow: {
    color: COLORS.accent,
    fontFamily: FONTS.bold,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
  },
});
