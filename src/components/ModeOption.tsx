import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Ellipse, G, Path } from 'react-native-svg';

import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { ContentMode } from '@/types';

type ModeOptionProps = {
  mode: ContentMode;
  isSelected: boolean;
  optionIndex: number;
  optionCount: number;
  onPress: () => void;
};

const SCENE_WIDTH = 360;
const SCENE_SLICE_HEIGHT = 124;

type Point = {
  x: number;
  y: number;
};

type LeafStroke = {
  t: number;
  side: -1 | 1;
  length: number;
  color: string;
  opacity: number;
  width: number;
};

type ShapedLeaf = {
  body: string;
  vein: string;
};

type WillowStrand = {
  start: Point;
  controlOne: Point;
  controlTwo: Point;
  end: Point;
  color: string;
  width: number;
  opacity: number;
  leaves: LeafStroke[];
};

function makeLeafStrokes(count: number, startT = 0.16, color = COLORS.lotusLeafGreen): LeafStroke[] {
  return Array.from({ length: count }, (_, index) => {
    const t = startT + (index / Math.max(count - 1, 1)) * (0.92 - startT);
    const side: -1 | 1 = index % 2 === 0 ? -1 : 1;
    const highlight = index % 7 === 3;
    const aqua = index % 5 === 2;

    return {
      t,
      side,
      length: 22 + (index % 4) * 5,
      color: highlight ? COLORS.lotusGold : aqua ? COLORS.rippleAqua : color,
      opacity: highlight ? 0.24 : aqua ? 0.28 : 0.42,
      width: 5.4 + (index % 3) * 0.7,
    };
  });
}

const WILLOW_STRANDS: WillowStrand[] = [
  {
    start: { x: 340, y: 10 },
    controlOne: { x: 260, y: 58 },
    controlTwo: { x: 72, y: 242 },
    end: { x: -16, y: 612 },
    color: COLORS.lotusLeafGreen,
    width: 3.4,
    opacity: 0.48,
    leaves: makeLeafStrokes(28, 0.08),
  },
  {
    start: { x: 324, y: 28 },
    controlOne: { x: 356, y: 132 },
    controlTwo: { x: 256, y: 336 },
    end: { x: 92, y: 742 },
    color: COLORS.rippleAqua,
    width: 2.8,
    opacity: 0.34,
    leaves: makeLeafStrokes(26, 0.1, COLORS.lotusLeafGreen),
  },
  {
    start: { x: 354, y: 66 },
    controlOne: { x: 282, y: 84 },
    controlTwo: { x: 408, y: 310 },
    end: { x: 340, y: 710 },
    color: COLORS.lotusLeafGreen,
    width: 2.8,
    opacity: 0.44,
    leaves: makeLeafStrokes(24, 0.1),
  },
  {
    start: { x: 338, y: 94 },
    controlOne: { x: 250, y: 196 },
    controlTwo: { x: 306, y: 360 },
    end: { x: 154, y: 724 },
    color: COLORS.lotusLeafGreen,
    width: 2.2,
    opacity: 0.38,
    leaves: makeLeafStrokes(23, 0.12),
  },
  {
    start: { x: 328, y: 146 },
    controlOne: { x: 250, y: 230 },
    controlTwo: { x: 124, y: 402 },
    end: { x: 40, y: 704 },
    color: COLORS.rippleAqua,
    width: 1.9,
    opacity: 0.3,
    leaves: makeLeafStrokes(22, 0.13, COLORS.lotusLeafGreen),
  },
  {
    start: { x: 346, y: 176 },
    controlOne: { x: 340, y: 260 },
    controlTwo: { x: 232, y: 468 },
    end: { x: 198, y: 730 },
    color: COLORS.lotusLeafGreen,
    width: 1.8,
    opacity: 0.32,
    leaves: makeLeafStrokes(22, 0.14),
  },
  {
    start: { x: 332, y: 238 },
    controlOne: { x: 236, y: 318 },
    controlTwo: { x: 276, y: 506 },
    end: { x: 116, y: 734 },
    color: COLORS.rippleAqua,
    width: 1.6,
    opacity: 0.25,
    leaves: makeLeafStrokes(20, 0.16),
  },
  {
    start: { x: 320, y: 264 },
    controlOne: { x: 202, y: 338 },
    controlTwo: { x: 62, y: 514 },
    end: { x: -24, y: 720 },
    color: COLORS.lotusLeafGreen,
    width: 1.5,
    opacity: 0.28,
    leaves: makeLeafStrokes(20, 0.16),
  },
];

function cubicPoint(strand: WillowStrand, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x:
      mt2 * mt * strand.start.x +
      3 * mt2 * t * strand.controlOne.x +
      3 * mt * t2 * strand.controlTwo.x +
      t2 * t * strand.end.x,
    y:
      mt2 * mt * strand.start.y +
      3 * mt2 * t * strand.controlOne.y +
      3 * mt * t2 * strand.controlTwo.y +
      t2 * t * strand.end.y,
  };
}

function cubicTangent(strand: WillowStrand, t: number): Point {
  const mt = 1 - t;

  return {
    x:
      3 * mt * mt * (strand.controlOne.x - strand.start.x) +
      6 * mt * t * (strand.controlTwo.x - strand.controlOne.x) +
      3 * t * t * (strand.end.x - strand.controlTwo.x),
    y:
      3 * mt * mt * (strand.controlOne.y - strand.start.y) +
      6 * mt * t * (strand.controlTwo.y - strand.controlOne.y) +
      3 * t * t * (strand.end.y - strand.controlTwo.y),
  };
}

function strandPath(strand: WillowStrand) {
  return `M${strand.start.x} ${strand.start.y} C${strand.controlOne.x} ${strand.controlOne.y} ${strand.controlTwo.x} ${strand.controlTwo.y} ${strand.end.x} ${strand.end.y}`;
}

function leafShapePath(strand: WillowStrand, leaf: LeafStroke): ShapedLeaf {
  const point = cubicPoint(strand, leaf.t);
  const tangent = cubicTangent(strand, leaf.t);
  const length = Math.hypot(tangent.x, tangent.y) || 1;
  const unitX = tangent.x / length;
  const unitY = tangent.y / length;
  const normalX = -unitY * leaf.side;
  const normalY = unitX * leaf.side;
  const baseInset = leaf.length * 0.1;
  const leafLength = leaf.length * 1.42;
  const leafWidth = leaf.width * 1.46;
  const baseX = point.x + unitX * baseInset;
  const baseY = point.y + unitY * baseInset;
  const directionX = normalX * 0.62 + unitX * 0.12;
  const directionY = normalY * 0.5 + unitY * 0.1 + 0.86;
  const directionLength = Math.hypot(directionX, directionY) || 1;
  const leafDirX = directionX / directionLength;
  const leafDirY = directionY / directionLength;
  const tipX = baseX + leafDirX * leafLength;
  const tipY = baseY + leafDirY * leafLength;
  const midX = (baseX + tipX) / 2;
  const midY = (baseY + tipY) / 2;
  const sideX = -leafDirY;
  const sideY = leafDirX;
  const shoulderOneX = midX + sideX * leafWidth + leafDirX * leaf.length * 0.04;
  const shoulderOneY = midY + sideY * leafWidth + leafDirY * leaf.length * 0.04;
  const shoulderTwoX = midX - sideX * leafWidth + leafDirX * leaf.length * 0.02;
  const shoulderTwoY = midY - sideY * leafWidth + leafDirY * leaf.length * 0.02;
  const body = `M${baseX} ${baseY} C${shoulderOneX} ${shoulderOneY} ${tipX - leafDirX * leafWidth * 0.22} ${tipY - leafDirY * leafWidth * 0.22} ${tipX} ${tipY} C${tipX - leafDirX * leafWidth * 0.28} ${tipY - leafDirY * leafWidth * 0.28} ${shoulderTwoX} ${shoulderTwoY} ${baseX} ${baseY} Z`;
  const vein = `M${baseX + leafDirX * leafLength * 0.12} ${baseY + leafDirY * leafLength * 0.12} L${tipX - leafDirX * leafLength * 0.12} ${tipY - leafDirY * leafLength * 0.12}`;

  return { body, vein };
}

function SceneLeaf({ color = COLORS.lotusLeafGreen }: { color?: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 44 24">
      <Path
        d="M3 13 C14 -1 32 0 41 13 C28 23 14 22 3 13 Z"
        fill={color}
        opacity={0.88}
      />
      <Path
        d="M8 13 C18 11 29 11 38 13"
        stroke={COLORS.warmWhite}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity={0.34}
      />
    </Svg>
  );
}

function ModeCardScenery({
  optionIndex,
  optionCount,
}: {
  optionIndex: number;
  optionCount: number;
}) {
  const sway = useRef(new Animated.Value(0)).current;
  const leafOne = useRef(new Animated.Value(0)).current;
  const leafTwo = useRef(new Animated.Value(0)).current;
  const totalHeight = Math.max(optionCount, 1) * SCENE_SLICE_HEIGHT;
  const viewBox = `0 ${optionIndex * SCENE_SLICE_HEIGHT} ${SCENE_WIDTH} ${SCENE_SLICE_HEIGHT}`;

  useEffect(() => {
    const swayAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const leafOneAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(optionIndex * 240),
        Animated.timing(leafOne, {
          toValue: 1,
          duration: 6200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(leafOne, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const leafTwoAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(1100 + optionIndex * 180),
        Animated.timing(leafTwo, {
          toValue: 1,
          duration: 7600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(leafTwo, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    swayAnimation.start();
    leafOneAnimation.start();
    leafTwoAnimation.start();

    return () => {
      swayAnimation.stop();
      leafOneAnimation.stop();
      leafTwoAnimation.stop();
    };
  }, [leafOne, leafTwo, optionIndex, sway]);

  const branchTranslateX = sway.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });
  const branchRotate = sway.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-3.5deg'],
  });
  const leafOneOpacity = leafOne.interpolate({
    inputRange: [0, 0.15, 0.82, 1],
    outputRange: [0, 0.5, 0.5, 0],
  });
  const leafTwoOpacity = leafTwo.interpolate({
    inputRange: [0, 0.18, 0.8, 1],
    outputRange: [0, 0.34, 0.34, 0],
  });

  return (
    <View pointerEvents="none" style={styles.sceneLayer}>
      <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="none">
        <Ellipse cx="180" cy={totalHeight * 0.75} rx="270" ry="118" fill={COLORS.rippleAqua} opacity={0.13} />
        <Ellipse cx="118" cy={totalHeight * 0.76} rx="142" ry="42" fill={COLORS.warmWhite} opacity={0.07} />
        <Ellipse cx="252" cy={totalHeight * 0.72} rx="164" ry="52" fill={COLORS.lotusLeafGreen} opacity={0.09} />
        <Path
          d={`M6 ${totalHeight * 0.78} C84 ${totalHeight * 0.72} 142 ${totalHeight * 0.8} 224 ${totalHeight * 0.74} C284 ${totalHeight * 0.7} 326 ${totalHeight * 0.73} 366 ${totalHeight * 0.76}`}
          stroke={COLORS.rippleAqua}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity={0.38}
        />
        <Path
          d={`M28 ${totalHeight * 0.84} C96 ${totalHeight * 0.8} 158 ${totalHeight * 0.87} 238 ${totalHeight * 0.82} C288 ${totalHeight * 0.79} 328 ${totalHeight * 0.81} 368 ${totalHeight * 0.84}`}
          stroke={COLORS.warmWhite}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity={0.22}
        />
        <Path
          d={`M42 ${totalHeight * 0.69} C104 ${totalHeight * 0.63} 164 ${totalHeight * 0.71} 234 ${totalHeight * 0.66} C288 ${totalHeight * 0.62} 328 ${totalHeight * 0.65} 368 ${totalHeight * 0.68}`}
          stroke={COLORS.lotusLeafGreen}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity={0.14}
        />
      </Svg>

      <Animated.View
        style={[
          styles.sceneSwayLayer,
          {
            transform: [{ translateX: branchTranslateX }, { rotate: branchRotate }],
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="none">
          <Ellipse cx="318" cy={totalHeight * 0.2} rx="118" ry={totalHeight * 0.44} fill={COLORS.lotusLeafGreen} opacity={0.11} />
          <Ellipse cx="262" cy={totalHeight * 0.36} rx="140" ry={totalHeight * 0.5} fill={COLORS.rippleAqua} opacity={0.045} />
          {WILLOW_STRANDS.map((strand, strandIndex) => (
            <G key={`strand-${strandIndex}`}>
              <Path
                d={strandPath(strand)}
                stroke={strand.color}
                strokeWidth={strand.width}
                strokeLinecap="round"
                fill="none"
                opacity={strand.opacity}
              />
              {strand.leaves.map((leaf, leafIndex) => {
                const shapedLeaf = leafShapePath(strand, leaf);

                return (
                  <G key={`leaf-${strandIndex}-${leafIndex}`}>
                    <Path d={shapedLeaf.body} fill={leaf.color} opacity={leaf.opacity} />
                    <Path
                      d={shapedLeaf.vein}
                      stroke={COLORS.warmWhite}
                      strokeWidth="0.75"
                      strokeLinecap="round"
                      fill="none"
                      opacity={0.16}
                    />
                  </G>
                );
              })}
            </G>
          ))}
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.driftingLeaf,
          {
            left: 274 - optionIndex * 18,
            top: 16 + (optionIndex % 2) * 34,
            opacity: leafOneOpacity,
            transform: [
              {
                translateX: leafOne.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -96],
                }),
              },
              {
                translateY: leafOne.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 36],
                }),
              },
              {
                rotate: leafOne.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ['0deg', '-28deg', '18deg'],
                }),
              },
            ],
          },
        ]}
      >
        <SceneLeaf />
      </Animated.View>
      <Animated.View
        style={[
          styles.driftingLeafSmall,
          {
            right: 48 + optionIndex * 7,
            top: 58,
            opacity: leafTwoOpacity,
            transform: [
              {
                translateX: leafTwo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -78],
                }),
              },
              {
                translateY: leafTwo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 28],
                }),
              },
              {
                rotate: leafTwo.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ['0deg', '24deg', '-14deg'],
                }),
              },
            ],
          },
        ]}
      >
        <SceneLeaf color={COLORS.lotusGold} />
      </Animated.View>
    </View>
  );
}

export function ModeOption({
  mode,
  isSelected,
  optionIndex,
  optionCount,
  onPress,
}: ModeOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View pointerEvents="none" style={styles.cardGlow} />
      <View pointerEvents="none" style={styles.waterLine} />
      <ModeCardScenery optionIndex={optionIndex} optionCount={optionCount} />
      <View pointerEvents="none" style={styles.textScrim} />
      <View style={styles.textWrap}>
        <Text style={styles.label}>{mode.label}</Text>
        <Text style={styles.description}>{mode.description}</Text>
      </View>
      <View style={[styles.check, isSelected && styles.selectedCheck]}>
        <Ionicons
          name={isSelected ? 'checkmark' : 'add'}
          size={18}
          color={isSelected ? COLORS.warmWhite : COLORS.koiOrange}
        />
        {isSelected ? <Text style={styles.selectedText}>Selected</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(238,232,204,0.78)',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 24,
    borderColor: 'rgba(8,63,69,0.22)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 34,
    borderWidth: 1.2,
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: SPACING.md,
    ...SHADOWS.pondTile,
  },
  selectedCard: {
    borderColor: 'rgba(201,120,58,0.92)',
    borderWidth: 2,
    backgroundColor: 'rgba(243,233,210,0.92)',
  },
  cardGlow: {
    backgroundColor: 'rgba(232,176,93,0.1)',
    borderRadius: RADIUS.full,
    bottom: -36,
    height: 100,
    left: -24,
    position: 'absolute',
    width: 140,
  },
  waterLine: {
    borderColor: 'rgba(14,90,96,0.08)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    height: 72,
    position: 'absolute',
    right: -36,
    top: 20,
    transform: [{ rotate: '-12deg' }],
    width: 180,
  },
  sceneLayer: {
    bottom: 0,
    left: 0,
    opacity: 0.94,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  sceneSwayLayer: {
    bottom: -12,
    left: -8,
    position: 'absolute',
    right: -8,
    top: -12,
  },
  driftingLeaf: {
    height: 18,
    position: 'absolute',
    width: 33,
    zIndex: 2,
  },
  driftingLeafSmall: {
    height: 14,
    position: 'absolute',
    width: 26,
    zIndex: 2,
  },
  textScrim: {
    backgroundColor: 'rgba(243,233,210,0.4)',
    borderRadius: RADIUS.lg,
    bottom: 10,
    left: 10,
    position: 'absolute',
    right: 76,
    top: 10,
    zIndex: 3,
  },
  textWrap: {
    flex: 1,
    gap: 5,
    zIndex: 4,
  },
  label: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  description: {
    color: 'rgba(27,27,27,0.72)',
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  check: {
    alignItems: 'center',
    borderColor: 'rgba(14,90,96,0.28)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    height: 34,
    justifyContent: 'center',
    minWidth: 34,
    paddingHorizontal: 0,
    width: 34,
    zIndex: 4,
  },
  selectedText: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  selectedCheck: {
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.85)',
    minWidth: 96,
    paddingHorizontal: 10,
    width: 96,
  },
});
