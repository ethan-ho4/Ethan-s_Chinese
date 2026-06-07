import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { ChineseEntry } from '@/types';

type WidgetSize = 'small' | 'medium' | 'large';

type WidgetPreviewCardProps = {
  entry: ChineseEntry;
  modeLabel: string;
  size: WidgetSize;
};

const SIZE_LABELS: Record<WidgetSize, string> = {
  small: 'Small Widget',
  medium: 'Medium Widget',
  large: 'Large Widget',
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
        <Ellipse
          cx="230"
          cy="132"
          rx={isSmall ? 34 : 56}
          ry={isSmall ? 10 : 17}
          stroke={COLORS.warmWhite}
          strokeWidth="2"
          fill="none"
          opacity={isSmall ? 0.22 : 0.3}
        />
        <Ellipse
          cx="214"
          cy="146"
          rx={isSmall ? 78 : 112}
          ry={isSmall ? 23 : 34}
          stroke={COLORS.lotusGold}
          strokeWidth="1.6"
          fill="none"
          opacity={isSmall ? 0.18 : 0.25}
        />
        <Path
          d="M24 176 C92 135 154 184 230 142 C270 120 298 128 324 144"
          stroke={COLORS.rippleAqua}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity={isSmall ? 0.24 : 0.32}
        />
        <Path
          d="M68 194 C122 166 172 190 230 166 C262 152 292 154 320 170"
          stroke={COLORS.warmWhite}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          opacity={isSmall ? 0.16 : 0.22}
        />
        <Path
          d="M166 126 C194 96 252 94 288 126 C252 156 196 156 166 126 Z"
          fill={COLORS.mistyIvory}
          opacity={isSmall ? 0.34 : 0.48}
        />
        <Path
          d="M202 124 C224 106 254 108 276 124 C252 136 225 136 202 124 Z"
          fill={COLORS.koiOrange}
          opacity={isSmall ? 0.46 : 0.64}
        />
        <Path
          d="M170 126 C150 116 132 114 116 119 C134 132 150 137 173 132 Z"
          fill={COLORS.inkBlack}
          opacity={isSmall ? 0.28 : 0.4}
        />
        <Circle cx="274" cy="118" r="2.4" fill={COLORS.inkBlack} opacity={isSmall ? 0.44 : 0.62} />
        <Circle cx="286" cy="92" r="3.8" fill={COLORS.rippleAqua} opacity={isSmall ? 0.3 : 0.42} />
        <Circle cx="300" cy="82" r="2.8" fill={COLORS.warmWhite} opacity={isSmall ? 0.24 : 0.34} />
        <Circle cx="304" cy="108" r="3.2" fill={COLORS.lotusGold} opacity={isSmall ? 0.26 : 0.38} />
        <Circle cx="244" cy="88" r="2.4" fill={COLORS.rippleAqua} opacity={isSmall ? 0.22 : 0.32} />
      </Svg>
    </View>
  );
}

export function WidgetPreviewCard({ entry, modeLabel, size }: WidgetPreviewCardProps) {
  return (
    <View style={[styles.wrapper, size === 'small' && styles.smallWrapper]}>
      <Text style={styles.sizeLabel}>{SIZE_LABELS[size]}</Text>
      <View style={[styles.widget, styles[size], SHADOWS.pondTile]}>
        <View pointerEvents="none" style={styles.widgetGlow} />
        <View pointerEvents="none" style={styles.waterLine} />
        <WidgetPondDepth size={size} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.mode}>{modeLabel}</Text>
            <Text style={styles.kind}>{entry.kind}</Text>
          </View>
          <Text style={[styles.mandarin, size === 'small' && styles.smallMandarin]}>
            {entry.mandarin}
          </Text>
          <Text style={styles.pinyin}>{entry.pinyin}</Text>
          {size !== 'small' ? <Text style={styles.english}>{entry.english}</Text> : null}
          {size === 'large' ? <Text style={styles.definition}>{entry.definition}</Text> : null}
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
    justifyContent: 'space-between',
    zIndex: 2,
  },
  widgetGlow: {
    backgroundColor: 'rgba(232,176,93,0.1)',
    borderRadius: RADIUS.full,
    bottom: -44,
    height: 130,
    left: -36,
    position: 'absolute',
    width: 170,
  },
  waterLine: {
    borderColor: 'rgba(14,90,96,0.18)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    height: 96,
    position: 'absolute',
    right: -58,
    top: 48,
    transform: [{ rotate: '-12deg' }],
    width: 240,
  },
  depthLayer: {
    bottom: -8,
    height: 220,
    opacity: 1,
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
  mode: {
    color: COLORS.koiOrange,
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  kind: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.bold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  mandarin: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 42,
    lineHeight: 52,
  },
  smallMandarin: {
    fontSize: 34,
    lineHeight: 42,
  },
  pinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 18,
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
    fontSize: 15,
    lineHeight: 22,
  },
});
