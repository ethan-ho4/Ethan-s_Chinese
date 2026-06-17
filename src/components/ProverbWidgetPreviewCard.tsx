import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { getProverbChinese } from '@/services/dailyProverb';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { ChineseProverb } from '@/types';

type WidgetSize = 'small' | 'medium' | 'large';

type ProverbWidgetPreviewCardProps = {
  proverb: ChineseProverb;
  size: WidgetSize;
};

const SIZE_LABELS: Record<WidgetSize, string> = {
  small: 'Small Proverb Widget',
  medium: 'Medium Proverb Widget',
  large: 'Large Proverb Widget',
};

function WidgetPondDepth({ size }: { size: WidgetSize }) {
  const isSmall = size === 'small';

  return (
    <View pointerEvents="none" style={[styles.depthLayer, isSmall && styles.smallDepthLayer]}>
      <Svg width="100%" height="100%" viewBox="0 0 320 220">
        <Ellipse
          cx="235"
          cy="132"
          rx={isSmall ? 62 : 92}
          ry={isSmall ? 18 : 28}
          stroke={COLORS.rippleAqua}
          strokeWidth="3"
          fill="none"
          opacity={isSmall ? 0.3 : 0.38}
        />
        <Path
          d="M166 126 C194 96 252 94 288 126 C252 156 196 156 166 126 Z"
          fill={COLORS.mistyIvory}
          opacity={isSmall ? 0.34 : 0.48}
        />
        <Circle cx="286" cy="92" r="3.8" fill={COLORS.rippleAqua} opacity={isSmall ? 0.3 : 0.42} />
      </Svg>
    </View>
  );
}

export function ProverbWidgetPreviewCard({ proverb, size }: ProverbWidgetPreviewCardProps) {
  const { script } = usePreferences();
  const displayMandarin = getProverbChinese(proverb, script);
  const english =
    size === 'small' && proverb.english.length > 48
      ? `${proverb.english.slice(0, 45).trim()}...`
      : proverb.english;

  return (
    <View style={[styles.wrapper, size === 'small' && styles.smallWrapper]}>
      <Text style={styles.sizeLabel}>{SIZE_LABELS[size]}</Text>
      <View style={[styles.widget, styles[size], SHADOWS.pondTile]}>
        <View pointerEvents="none" style={styles.widgetGlow} />
        <WidgetPondDepth size={size} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>Daily Proverb</Text>
            <Text style={styles.kind}>谚语</Text>
          </View>
          <Text style={[styles.mandarin, size === 'small' && styles.smallMandarin]}>
            {displayMandarin}
          </Text>
          {size !== 'small' ? <Text style={styles.pinyin}>{proverb.pinyin}</Text> : null}
          {size !== 'small' ? <Text style={styles.english}>{english}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: SPACING.sm,
  },
  smallWrapper: {
    alignSelf: 'flex-start',
  },
  sizeLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  widget: {
    backgroundColor: COLORS.surfacePondStrong,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 24,
    borderColor: COLORS.borderSoft,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 38,
    borderWidth: 1.2,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: SPACING.md,
  },
  content: {
    gap: SPACING.sm,
    zIndex: 2,
  },
  widgetGlow: {
    backgroundColor: 'rgba(126,159,61,0.12)',
    borderRadius: RADIUS.full,
    bottom: -44,
    height: 130,
    left: -36,
    position: 'absolute',
    width: 170,
  },
  depthLayer: {
    bottom: -8,
    height: 220,
    position: 'absolute',
    right: -6,
    width: 320,
    zIndex: 1,
  },
  smallDepthLayer: {
    bottom: -12,
    height: 170,
    right: -44,
    width: 250,
  },
  small: {
    height: 170,
    width: 170,
  },
  medium: {
    minHeight: 170,
    width: '100%',
  },
  large: {
    minHeight: 280,
    width: '100%',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  label: {
    color: COLORS.lotusLeafGreen,
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  kind: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  mandarin: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 28,
    lineHeight: 38,
  },
  smallMandarin: {
    fontSize: 22,
    lineHeight: 30,
  },
  pinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 15,
  },
  english: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 22,
  },
});
