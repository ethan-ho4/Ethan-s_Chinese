import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { COLORS } from '@/theme';

type KoiScrollSceneProps = {
  scrollY: Animated.Value;
  variant?: 'hero' | 'subtle';
};

type KoiFishProps = {
  palette: 'orange' | 'ink';
};

type LotusPadProps = {
  color?: string;
};

type Point = {
  x: number;
  y: number;
};

type PathSample = Point & {
  angle: number;
};

const FALLING_LEAVES = [
  { left: '8%', size: 18, delay: 0, duration: 9200, drift: 44, opacity: 0.28 },
  { left: '28%', size: 12, delay: 1800, duration: 11800, drift: -34, opacity: 0.2 },
  { left: '52%', size: 15, delay: 3600, duration: 10400, drift: 36, opacity: 0.24 },
  { left: '72%', size: 10, delay: 900, duration: 13000, drift: -26, opacity: 0.18 },
  { left: '88%', size: 14, delay: 5200, duration: 11200, drift: -42, opacity: 0.22 },
] as const;

const FISH_ONE_SCROLL_END = 255;
const FISH_TWO_SCROLL_END = 524;
const ORANGE_EXIT_SCROLL_START = 310;
const ORANGE_EXIT_SCROLL_END = 672;

function cubicBezier(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
    y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
  };
}

function cubicBezierTangent(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const mt = 1 - t;

  return {
    x:
      3 * mt * mt * (p1.x - p0.x) +
      6 * mt * t * (p2.x - p1.x) +
      3 * t * t * (p3.x - p2.x),
    y:
      3 * mt * mt * (p1.y - p0.y) +
      6 * mt * t * (p2.y - p1.y) +
      3 * t * t * (p3.y - p2.y),
  };
}

function sampleBezierPath(
  points: [Point, Point, Point, Point],
  sampleCount: number,
): PathSample[] {
  return Array.from({ length: sampleCount }, (_, index) => {
    const t = index / (sampleCount - 1);
    const position = cubicBezier(t, points[0], points[1], points[2], points[3]);
    const tangent = cubicBezierTangent(t, points[0], points[1], points[2], points[3]);

    return {
      ...position,
      angle: (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI,
    };
  });
}

function makeInputRange(sampleCount: number, endValue: number): number[] {
  return Array.from({ length: sampleCount }, (_, index) => (
    (index / (sampleCount - 1)) * endValue
  ));
}

function makeOffsetInputRange(sampleCount: number, startValue: number, endValue: number): number[] {
  return Array.from({ length: sampleCount }, (_, index) => (
    startValue + (index / (sampleCount - 1)) * (endValue - startValue)
  ));
}

function outputNumbers(samples: PathSample[], key: 'x' | 'y'): number[] {
  return samples.map((sample) => sample[key]);
}

function outputAngles(samples: PathSample[]): string[] {
  return samples.map((sample) => `${sample.angle}deg`);
}

function outputUprightRollScales(samples: PathSample[], rollIn = false): number[] {
  const rollScales: number[] = samples.map((sample) => (Math.abs(sample.angle) > 90 ? -1 : 1));

  if (rollIn && rollScales.length > 2) {
    rollScales[0] = 1;
    rollScales[1] = 0.18;
  }

  return rollScales;
}

function joinPathSamples(first: PathSample[], second: PathSample[]): PathSample[] {
  return [...first, ...second.slice(1)];
}

const FISH_ONE_PATH = sampleBezierPath(
  [
    { x: -42, y: 42 },
    { x: 62, y: 20 },
    { x: 196, y: -78 },
    { x: 344, y: -188 },
  ],
  28,
);

const FISH_TWO_PATH = joinPathSamples(
  joinPathSamples(
    sampleBezierPath(
      [
        { x: -270, y: 152 },
        { x: -148, y: 126 },
        { x: -28, y: 214 },
        { x: 86, y: 190 },
      ],
      14,
    ),
    sampleBezierPath(
      [
        { x: 86, y: 190 },
        { x: 178, y: 170 },
        { x: 264, y: 222 },
        { x: 244, y: 304 },
      ],
      14,
    ),
  ),
  sampleBezierPath(
    [
      { x: 244, y: 304 },
      { x: 208, y: 430 },
      { x: -74, y: 386 },
      { x: -280, y: 552 },
    ],
    20,
  ),
);

const FISH_ONE_INPUT_RANGE = makeInputRange(FISH_ONE_PATH.length, FISH_ONE_SCROLL_END);
const FISH_TWO_INPUT_RANGE = makeInputRange(FISH_TWO_PATH.length, FISH_TWO_SCROLL_END);

const ORANGE_EXIT_PATH = joinPathSamples(
  joinPathSamples(
    sampleBezierPath(
      [
        { x: 314, y: 606 },
        { x: 284, y: 548 },
        { x: 326, y: 478 },
        { x: 222, y: 408 },
      ],
      12,
    ),
    sampleBezierPath(
      [
        { x: 222, y: 408 },
        { x: 122, y: 334 },
        { x: 132, y: 270 },
        { x: 36, y: 244 },
      ],
      12,
    ),
  ),
  sampleBezierPath(
    [
      { x: 36, y: 244 },
      { x: -64, y: 216 },
      { x: -156, y: 140 },
      { x: -286, y: 88 },
    ],
    12,
  ),
);
const ORANGE_EXIT_INPUT_RANGE = makeOffsetInputRange(
  ORANGE_EXIT_PATH.length,
  ORANGE_EXIT_SCROLL_START,
  ORANGE_EXIT_SCROLL_END,
);

function KoiFish({ palette }: KoiFishProps) {
  const isOrange = palette === 'orange';
  const bodyColor = isOrange ? COLORS.mistyIvory : COLORS.inkBlack;
  const patchColor = isOrange ? COLORS.koiOrange : COLORS.mistyIvory;
  const finColor = isOrange ? COLORS.inkBlack : COLORS.warmWhite;
  const tailColor = isOrange ? COLORS.inkBlack : COLORS.inkBlack;

  return (
    <Svg width="100%" height="100%" viewBox="0 0 300 150">
      <G opacity={0.98}>
        {/* Tail is only on the left; the rounded head and eye are only on the right. */}
        <Path
          d="M70 75 C108 31 214 26 266 75 C214 124 108 119 70 75 Z"
          fill={bodyColor}
        />
        <Path
          d="M98 71 C129 42 180 43 214 70 C177 86 136 86 98 71 Z"
          fill={patchColor}
          opacity={isOrange ? 0.9 : 0.72}
        />
        <Path
          d="M142 94 C171 86 200 94 224 111 C188 121 162 115 142 94 Z"
          fill={isOrange ? COLORS.koiOrangeMuted : COLORS.inkBlack}
          opacity={0.84}
        />
        <Path
          d="M151 60 C128 43 116 23 111 4 C137 14 155 34 164 60 Z"
          fill={finColor}
          opacity={0.75}
        />
        <Path
          d="M151 90 C127 108 116 129 112 147 C139 138 158 116 166 91 Z"
          fill={finColor}
          opacity={0.68}
        />
        <Path
          d="M79 75 C47 59 22 54 0 58 C25 73 49 80 78 80 Z"
          fill={tailColor}
          opacity={0.78}
        />
        <Path
          d="M79 76 C49 92 23 102 3 112 C33 113 59 100 85 83 Z"
          fill={tailColor}
          opacity={0.66}
        />
        <Path
          d="M255 67 C269 69 280 72 291 78"
          stroke={isOrange ? COLORS.koiOrangeMuted : COLORS.warmWhite}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={0.5}
        />
        <Circle cx="246" cy="62" r="4.2" fill={isOrange ? COLORS.inkBlack : COLORS.warmWhite} />
        <Path
          d="M178 98 C154 118 126 126 102 119"
          stroke={finColor}
          strokeWidth="5"
          strokeLinecap="round"
          opacity={0.45}
        />
        <Path
          d="M184 52 C158 36 130 33 108 42"
          stroke={finColor}
          strokeWidth="4"
          strokeLinecap="round"
          opacity={0.32}
        />
      </G>
    </Svg>
  );
}

function LotusLeaf() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 160 120">
      <Path
        d="M24 69 C42 22 98 10 136 50 C112 91 60 101 24 69 Z"
        fill={COLORS.lotusLeafGreen}
        opacity={0.42}
      />
      <Path
        d="M31 68 C62 64 94 58 129 49"
        stroke={COLORS.rippleAqua}
        strokeWidth="3"
        strokeLinecap="round"
        opacity={0.35}
      />
      <Path
        d="M78 60 C72 45 72 31 80 17"
        stroke={COLORS.rippleAqua}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.24}
      />
    </Svg>
  );
}

function LotusPad({ color = COLORS.lotusLeafGreen }: LotusPadProps) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 120 100">
      <Path
        d="M59 6 C91 4 118 24 115 52 C111 85 65 101 27 83 C-3 68 -2 30 28 12 C39 6 50 4 59 6 L64 48 L101 23 C91 12 74 6 59 6 Z"
        fill={color}
        opacity={0.76}
      />
      <Path
        d="M64 48 C49 38 38 26 29 13"
        stroke={COLORS.rippleAqua}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity={0.38}
      />
      <Path
        d="M64 48 C48 56 34 68 24 82"
        stroke={COLORS.rippleAqua}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity={0.32}
      />
      <Path
        d="M64 48 C80 58 95 61 112 57"
        stroke={COLORS.rippleAqua}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={0.3}
      />
      <Path
        d="M64 48 C59 66 59 81 64 96"
        stroke={COLORS.rippleAqua}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity={0.24}
      />
      <Circle cx="64" cy="48" r="4" fill={COLORS.lotusGold} opacity={0.55} />
    </Svg>
  );
}

export function KoiScrollScene({ scrollY, variant = 'hero' }: KoiScrollSceneProps) {
  const isSubtle = variant === 'subtle';
  const leafProgresses = useRef(FALLING_LEAVES.map(() => new Animated.Value(0)));

  useEffect(() => {
    const loops = leafProgresses.current.map((progress, index) => {
      const leaf = FALLING_LEAVES[index];

      return Animated.loop(
        Animated.sequence([
          Animated.delay(leaf.delay),
          Animated.timing(progress, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(progress, {
            toValue: 1,
            duration: leaf.duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(800),
        ]),
      );
    });

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, []);

  const fishOneTranslateX = scrollY.interpolate({
    inputRange: FISH_ONE_INPUT_RANGE,
    outputRange: outputNumbers(FISH_ONE_PATH, 'x'),
    extrapolate: 'clamp',
  });
  const fishOneTranslateY = scrollY.interpolate({
    inputRange: FISH_ONE_INPUT_RANGE,
    outputRange: outputNumbers(FISH_ONE_PATH, 'y'),
    extrapolate: 'clamp',
  });
  const fishOneRotate = scrollY.interpolate({
    inputRange: FISH_ONE_INPUT_RANGE,
    outputRange: outputAngles(FISH_ONE_PATH),
    extrapolate: 'clamp',
  });
  const fishOneScale = scrollY.interpolate({
    inputRange: [0, FISH_ONE_SCROLL_END * 0.5, FISH_ONE_SCROLL_END],
    outputRange: [isSubtle ? 0.42 : 0.56, isSubtle ? 0.58 : 0.84, isSubtle ? 0.5 : 0.72],
    extrapolate: 'clamp',
  });
  const fishOneOpacity = scrollY.interpolate({
    inputRange: [0, 50, FISH_ONE_SCROLL_END - 50, FISH_ONE_SCROLL_END],
    outputRange: [isSubtle ? 0.32 : 0.82, isSubtle ? 0.44 : 0.9, isSubtle ? 0.28 : 0.62, 0],
    extrapolate: 'clamp',
  });
  const orangePopOpacity = scrollY.interpolate({
    inputRange: [ORANGE_EXIT_SCROLL_START, ORANGE_EXIT_SCROLL_START + 34, ORANGE_EXIT_SCROLL_END - 60, ORANGE_EXIT_SCROLL_END],
    outputRange: [0, isSubtle ? 0.34 : 0.88, isSubtle ? 0.22 : 0.66, 0],
    extrapolate: 'clamp',
  });
  const orangePopScale = scrollY.interpolate({
    inputRange: [ORANGE_EXIT_SCROLL_START, ORANGE_EXIT_SCROLL_START + 42, ORANGE_EXIT_SCROLL_END],
    outputRange: [0.26, isSubtle ? 0.54 : 0.78, isSubtle ? 0.42 : 0.62],
    extrapolate: 'clamp',
  });
  const orangePopTranslateX = scrollY.interpolate({
    inputRange: ORANGE_EXIT_INPUT_RANGE,
    outputRange: outputNumbers(ORANGE_EXIT_PATH, 'x'),
    extrapolate: 'clamp',
  });
  const orangePopTranslateY = scrollY.interpolate({
    inputRange: ORANGE_EXIT_INPUT_RANGE,
    outputRange: outputNumbers(ORANGE_EXIT_PATH, 'y'),
    extrapolate: 'clamp',
  });
  const orangePopRotate = scrollY.interpolate({
    inputRange: ORANGE_EXIT_INPUT_RANGE,
    outputRange: outputAngles(ORANGE_EXIT_PATH),
    extrapolate: 'clamp',
  });
  const orangePopRollScaleY = scrollY.interpolate({
    inputRange: ORANGE_EXIT_INPUT_RANGE,
    outputRange: outputUprightRollScales(ORANGE_EXIT_PATH, true),
    extrapolate: 'clamp',
  });
  const orangePopSplashOpacity = scrollY.interpolate({
    inputRange: [ORANGE_EXIT_SCROLL_START - 16, ORANGE_EXIT_SCROLL_START + 26, ORANGE_EXIT_SCROLL_START + 118],
    outputRange: [0, isSubtle ? 0.24 : 0.62, 0],
    extrapolate: 'clamp',
  });
  const orangePopSplashScale = scrollY.interpolate({
    inputRange: [ORANGE_EXIT_SCROLL_START - 16, ORANGE_EXIT_SCROLL_START + 26, ORANGE_EXIT_SCROLL_START + 118],
    outputRange: [0.32, 1.24, 1.68],
    extrapolate: 'clamp',
  });
  const orangeExitTrailOpacity = scrollY.interpolate({
    inputRange: [ORANGE_EXIT_SCROLL_START + 24, ORANGE_EXIT_SCROLL_START + 110, ORANGE_EXIT_SCROLL_END - 40, ORANGE_EXIT_SCROLL_END],
    outputRange: [0, isSubtle ? 0.14 : 0.36, isSubtle ? 0.1 : 0.24, 0],
    extrapolate: 'clamp',
  });
  const fishTwoTranslateX = scrollY.interpolate({
    inputRange: FISH_TWO_INPUT_RANGE,
    outputRange: outputNumbers(FISH_TWO_PATH, 'x'),
    extrapolate: 'clamp',
  });
  const fishTwoTranslateY = scrollY.interpolate({
    inputRange: FISH_TWO_INPUT_RANGE,
    outputRange: outputNumbers(FISH_TWO_PATH, 'y'),
    extrapolate: 'clamp',
  });
  const fishTwoRotate = scrollY.interpolate({
    inputRange: FISH_TWO_INPUT_RANGE,
    outputRange: outputAngles(FISH_TWO_PATH),
    extrapolate: 'clamp',
  });
  const fishTwoRollScaleY = scrollY.interpolate({
    inputRange: FISH_TWO_INPUT_RANGE,
    outputRange: outputUprightRollScales(FISH_TWO_PATH),
    extrapolate: 'clamp',
  });
  const fishTwoScale = scrollY.interpolate({
    inputRange: [0, FISH_TWO_SCROLL_END * 0.45, FISH_TWO_SCROLL_END],
    outputRange: [isSubtle ? 0.4 : 0.54, isSubtle ? 0.6 : 0.82, isSubtle ? 0.48 : 0.68],
    extrapolate: 'clamp',
  });
  const fishTwoOpacity = scrollY.interpolate({
    inputRange: [0, 60, FISH_TWO_SCROLL_END - 70, FISH_TWO_SCROLL_END],
    outputRange: [0, isSubtle ? 0.38 : 0.78, isSubtle ? 0.28 : 0.66, 0],
    extrapolate: 'clamp',
  });
  const rippleScale = scrollY.interpolate({
    inputRange: [0, 215, 430],
    outputRange: [0.72, 1.18, 1.45],
    extrapolate: 'clamp',
  });
  const rippleOpacity = scrollY.interpolate({
    inputRange: [0, 161, 430],
    outputRange: [0.18, 0.42, 0.08],
    extrapolate: 'clamp',
  });
  const lotusTranslate = scrollY.interpolate({
    inputRange: [0, 430],
    outputRange: [0, isSubtle ? -18 : -38],
    extrapolate: 'clamp',
  });
  const splashScale = scrollY.interpolate({
    inputRange: [0, 108, 215, 323, 430],
    outputRange: [0.5, 1.18, 0.72, 1.3, 0.82],
    extrapolate: 'clamp',
  });
  const splashOpacity = scrollY.interpolate({
    inputRange: [0, 81, 181, 296, 430],
    outputRange: [0, isSubtle ? 0.22 : 0.55, 0.12, isSubtle ? 0.2 : 0.42, 0.05],
    extrapolate: 'clamp',
  });
  const upperTrailOpacity = scrollY.interpolate({
    inputRange: [0, 94, 296, 430],
    outputRange: [0, isSubtle ? 0.16 : 0.38, isSubtle ? 0.14 : 0.3, 0],
    extrapolate: 'clamp',
  });
  const turnTrailOpacity = scrollY.interpolate({
    inputRange: [121, 215, 336, 444],
    outputRange: [0, isSubtle ? 0.18 : 0.46, isSubtle ? 0.15 : 0.36, 0],
    extrapolate: 'clamp',
  });
  const lowerTrailOpacity = scrollY.interpolate({
    inputRange: [282, 376, 484],
    outputRange: [0, isSubtle ? 0.16 : 0.34, 0],
    extrapolate: 'clamp',
  });
  const scrollLeafTranslateX = scrollY.interpolate({
    inputRange: [0, 420],
    outputRange: [-34, isSubtle ? 28 : 96],
    extrapolate: 'clamp',
  });
  const scrollLeafTranslateY = scrollY.interpolate({
    inputRange: [0, 420],
    outputRange: [-54, isSubtle ? 210 : 370],
    extrapolate: 'clamp',
  });
  const scrollLeafOpacity = scrollY.interpolate({
    inputRange: [0, 40, 360, 420],
    outputRange: [0, isSubtle ? 0.24 : 0.46, isSubtle ? 0.18 : 0.34, 0],
    extrapolate: 'clamp',
  });
  const foregroundPadOpacity = scrollY.interpolate({
    inputRange: [120, 205, 310, 390],
    outputRange: [0, isSubtle ? 0.16 : 0.44, isSubtle ? 0.12 : 0.28, 0],
    extrapolate: 'clamp',
  });
  const foregroundPadScale = scrollY.interpolate({
    inputRange: [120, 220, 390],
    outputRange: [0.7, 1.04, 0.82],
    extrapolate: 'clamp',
  });
  const foregroundPadLift = scrollY.interpolate({
    inputRange: [120, 390],
    outputRange: [30, -54],
    extrapolate: 'clamp',
  });

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, isSubtle && styles.subtleScene]}
    >
      <View style={styles.pondGlow} />
      <Animated.View
        style={[
          styles.ripple,
          styles.rippleOne,
          {
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ripple,
          styles.rippleTwo,
          {
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.splashBurst,
          styles.splashBurstOne,
          {
            opacity: splashOpacity,
            transform: [{ scale: splashScale }],
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 160 120">
          <Path d="M22 70 C48 42 78 39 118 58" stroke={COLORS.rippleAqua} strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.8} />
          <Path d="M51 82 C65 67 83 66 101 77" stroke={COLORS.lotusGold} strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.58} />
          <Circle cx="42" cy="40" r="5" fill={COLORS.rippleAqua} opacity={0.65} />
          <Circle cx="116" cy="46" r="3.5" fill={COLORS.lotusGold} opacity={0.58} />
          <Circle cx="132" cy="72" r="4" fill={COLORS.rippleAqua} opacity={0.45} />
        </Svg>
      </Animated.View>
      <Animated.View
        style={[
          styles.splashBurst,
          styles.splashBurstTwo,
          {
            opacity: splashOpacity,
            transform: [{ scale: splashScale }],
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 140 112">
          <Path d="M18 58 C39 80 74 83 116 54" stroke={COLORS.rippleAqua} strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.72} />
          <Path d="M38 43 C59 32 82 32 104 45" stroke={COLORS.warmWhite} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity={0.36} />
          <Circle cx="34" cy="72" r="4" fill={COLORS.lotusGold} opacity={0.52} />
          <Circle cx="106" cy="36" r="3.5" fill={COLORS.rippleAqua} opacity={0.58} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.waterMark, styles.upperWaterMark, { opacity: upperTrailOpacity }]}>
        <Svg width="100%" height="100%" viewBox="0 0 280 120">
          <Path d="M8 70 C48 40 96 46 132 68 C174 94 218 50 274 58" stroke={COLORS.rippleAqua} strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.72} />
          <Path d="M42 90 C84 67 116 78 154 82 C190 86 220 62 260 66" stroke={COLORS.warmWhite} strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.3} />
          <Circle cx="62" cy="52" r="3" fill={COLORS.rippleAqua} opacity={0.58} />
          <Circle cx="184" cy="82" r="2.5" fill={COLORS.lotusGold} opacity={0.5} />
          <Circle cx="235" cy="57" r="3.4" fill={COLORS.rippleAqua} opacity={0.42} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.waterMark, styles.turnWaterMark, { opacity: turnTrailOpacity }]}>
        <Svg width="100%" height="100%" viewBox="0 0 230 170">
          <Path d="M34 58 C86 24 150 44 178 82 C214 132 134 156 54 120" stroke={COLORS.rippleAqua} strokeWidth="3.5" strokeLinecap="round" fill="none" opacity={0.72} />
          <Path d="M76 82 C112 58 154 72 166 102" stroke={COLORS.lotusGold} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity={0.55} />
          <Ellipse cx="150" cy="102" rx="40" ry="14" stroke={COLORS.warmWhite} strokeWidth="2" fill="none" opacity={0.22} />
          <Circle cx="174" cy="88" r="4" fill={COLORS.rippleAqua} opacity={0.5} />
          <Circle cx="62" cy="126" r="3" fill={COLORS.lotusGold} opacity={0.5} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.waterMark, styles.lowerWaterMark, { opacity: lowerTrailOpacity }]}>
        <Svg width="100%" height="100%" viewBox="0 0 260 120">
          <Path d="M248 22 C220 74 150 30 106 62 C74 86 45 82 10 98" stroke={COLORS.rippleAqua} strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.68} />
          <Path d="M214 50 C178 75 140 50 104 76 C78 95 52 94 28 101" stroke={COLORS.warmWhite} strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.24} />
          <Circle cx="218" cy="52" r="3.2" fill={COLORS.lotusGold} opacity={0.46} />
          <Circle cx="84" cy="86" r="2.7" fill={COLORS.rippleAqua} opacity={0.5} />
        </Svg>
      </Animated.View>
      <Animated.View
        style={[
          styles.waterMark,
          styles.orangePopWaterMark,
          {
            opacity: orangePopSplashOpacity,
            transform: [{ scale: orangePopSplashScale }],
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox="0 0 180 130">
          <Ellipse cx="94" cy="66" rx="74" ry="26" stroke={COLORS.rippleAqua} strokeWidth="3.2" fill="none" opacity={0.66} />
          <Ellipse cx="96" cy="66" rx="46" ry="15" stroke={COLORS.warmWhite} strokeWidth="2.2" fill="none" opacity={0.34} />
          <Path d="M24 74 C61 39 114 38 158 61" stroke={COLORS.warmWhite} strokeWidth="2.8" strokeLinecap="round" fill="none" opacity={0.36} />
          <Path d="M48 96 C82 76 120 77 150 92" stroke={COLORS.lotusGold} strokeWidth="2.8" strokeLinecap="round" fill="none" opacity={0.56} />
          <Path d="M70 35 C82 21 101 19 116 31" stroke={COLORS.rippleAqua} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity={0.5} />
          <Circle cx="38" cy="48" r="3.8" fill={COLORS.rippleAqua} opacity={0.62} />
          <Circle cx="57" cy="30" r="2.6" fill={COLORS.warmWhite} opacity={0.42} />
          <Circle cx="119" cy="28" r="3" fill={COLORS.rippleAqua} opacity={0.5} />
          <Circle cx="142" cy="43" r="4.2" fill={COLORS.lotusGold} opacity={0.54} />
          <Circle cx="158" cy="78" r="2.8" fill={COLORS.rippleAqua} opacity={0.48} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.waterMark, styles.orangeExitWaterMark, { opacity: orangeExitTrailOpacity }]}>
        <Svg width="100%" height="100%" viewBox="0 0 320 260">
          <Path d="M300 232 C274 190 306 153 218 132 C145 114 151 82 92 73 C55 68 33 47 8 32" stroke={COLORS.rippleAqua} strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.58} />
          <Path d="M267 212 C244 178 260 150 202 137 C153 127 139 104 98 91" stroke={COLORS.warmWhite} strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.22} />
          <Path d="M224 190 C202 160 206 135 150 116 C113 104 99 85 62 62" stroke={COLORS.lotusGold} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity={0.36} />
          <Circle cx="265" cy="205" r="3.5" fill={COLORS.rippleAqua} opacity={0.5} />
          <Circle cx="196" cy="132" r="2.8" fill={COLORS.warmWhite} opacity={0.3} />
          <Circle cx="88" cy="74" r="3" fill={COLORS.lotusGold} opacity={0.4} />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.lotusOne, { transform: [{ translateY: lotusTranslate }] }]}>
        <LotusLeaf />
      </Animated.View>
      <Animated.View style={[styles.lotusTwo, { transform: [{ translateY: lotusTranslate }] }]}>
        <LotusLeaf />
      </Animated.View>
      <Animated.View
        style={[
          styles.scrollLeaf,
          {
            opacity: scrollLeafOpacity,
            transform: [
              { translateX: scrollLeafTranslateX },
              { translateY: scrollLeafTranslateY },
              { rotate: '18deg' },
            ],
          },
        ]}
      >
        <LotusPad color={COLORS.lotusLeafGreen} />
      </Animated.View>
      {FALLING_LEAVES.map((leaf, index) => {
        const progress = leafProgresses.current[index];
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-84, 820],
        });
        const translateX = progress.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, leaf.drift, leaf.drift * 0.45],
        });
        const opacity = progress.interpolate({
          inputRange: [0, 0.14, 0.82, 1],
          outputRange: [0, leaf.opacity * (isSubtle ? 0.42 : 1), leaf.opacity * (isSubtle ? 0.36 : 0.88), 0],
        });

        return (
          <Animated.View
            key={`${leaf.left}-${leaf.delay}`}
            style={[
              styles.loopLeaf,
              {
                left: leaf.left,
                height: leaf.size * 1.35,
                opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { scale: isSubtle ? 0.72 : 1 },
                ],
                width: leaf.size,
              },
            ]}
          >
            <LotusPad color={index % 2 === 0 ? COLORS.lotusGold : COLORS.lotusLeafGreen} />
          </Animated.View>
        );
      })}
      <Animated.View
        style={[
          styles.foregroundLotusPad,
          styles.foregroundLotusPadLeft,
          {
            opacity: foregroundPadOpacity,
            transform: [
              { translateY: foregroundPadLift },
              { rotate: '-12deg' },
              { scale: foregroundPadScale },
            ],
          },
        ]}
      >
        <LotusPad color={COLORS.lotusLeafGreen} />
      </Animated.View>
      <Animated.View
        style={[
          styles.foregroundLotusPad,
          styles.foregroundLotusPadRight,
          {
            opacity: foregroundPadOpacity,
            transform: [
              { translateY: foregroundPadLift },
              { rotate: '16deg' },
              { scale: foregroundPadScale },
            ],
          },
        ]}
      >
        <LotusPad color="#65B84A" />
      </Animated.View>
      <Animated.View
        style={[
          styles.foregroundLotusPad,
          styles.foregroundLotusPadBottom,
          {
            opacity: foregroundPadOpacity,
            transform: [
              { translateY: foregroundPadLift },
              { rotate: '8deg' },
              { scale: foregroundPadScale },
            ],
          },
        ]}
      >
        <LotusPad color="#8DC742" />
      </Animated.View>
      <Animated.View
        style={[
          styles.foregroundLotusPad,
          styles.foregroundLotusPadUpperLeft,
          {
            opacity: foregroundPadOpacity,
            transform: [
              { translateY: foregroundPadLift },
              { rotate: '22deg' },
              { scale: foregroundPadScale },
            ],
          },
        ]}
      >
        <LotusPad color="#6FA844" />
      </Animated.View>
      <Animated.View
        style={[
          styles.foregroundLotusPad,
          styles.foregroundLotusPadMidRight,
          {
            opacity: foregroundPadOpacity,
            transform: [
              { translateY: foregroundPadLift },
              { rotate: '-20deg' },
              { scale: foregroundPadScale },
            ],
          },
        ]}
      >
        <LotusPad color={COLORS.lotusLeafGreen} />
      </Animated.View>
      <Animated.View
        style={[
          styles.foregroundLotusPad,
          styles.foregroundLotusPadLowerLeft,
          {
            opacity: foregroundPadOpacity,
            transform: [
              { translateY: foregroundPadLift },
              { rotate: '14deg' },
              { scale: foregroundPadScale },
            ],
          },
        ]}
      >
        <LotusPad color="#9BCB55" />
      </Animated.View>
      <Animated.View
        style={[
          styles.koi,
          styles.orangeKoi,
          {
            opacity: fishOneOpacity,
            transform: [
              { translateX: fishOneTranslateX },
              { translateY: fishOneTranslateY },
              { rotate: fishOneRotate },
              { scale: fishOneScale },
            ],
          },
        ]}
      >
        <KoiFish palette="orange" />
      </Animated.View>
      <Animated.View
        style={[
          styles.koi,
          styles.orangeKoi,
          {
            opacity: orangePopOpacity,
            transform: [
              { translateX: orangePopTranslateX },
              { translateY: orangePopTranslateY },
              { rotate: orangePopRotate },
              { scaleY: orangePopRollScaleY },
              { scale: orangePopScale },
            ],
          },
        ]}
      >
        <KoiFish palette="orange" />
      </Animated.View>
      <Animated.View
        style={[
          styles.koi,
          styles.inkKoi,
          {
            opacity: fishTwoOpacity,
            transform: [
              { translateX: fishTwoTranslateX },
              { translateY: fishTwoTranslateY },
              { rotate: fishTwoRotate },
              { scaleY: fishTwoRollScaleY },
              { scale: fishTwoScale },
            ],
          },
        ]}
      >
        <KoiFish palette="ink" />
      </Animated.View>
      <Svg style={styles.waterLines} viewBox="0 0 390 760">
        <Path
          d="M-20 198 C70 170 126 218 210 190 C286 164 330 180 416 148"
          stroke={COLORS.rippleAqua}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity={0.16}
        />
        <Path
          d="M-12 562 C80 520 150 590 250 544 C310 518 354 526 416 504"
          stroke={COLORS.rippleAqua}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity={0.12}
        />
        <Ellipse cx="292" cy="310" rx="64" ry="18" stroke={COLORS.rippleAqua} strokeWidth="2" fill="none" opacity={0.15} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  subtleScene: {
    opacity: 0.64,
  },
  pondGlow: {
    position: 'absolute',
    top: -120,
    left: -80,
    right: -80,
    height: 360,
    borderBottomLeftRadius: 220,
    borderBottomRightRadius: 220,
    backgroundColor: 'rgba(127,199,194,0.18)',
  },
  koi: {
    position: 'absolute',
    height: 132,
    width: 248,
  },
  orangeKoi: {
    top: 72,
    left: 0,
  },
  inkKoi: {
    top: 86,
    left: 0,
  },
  ripple: {
    position: 'absolute',
    borderColor: COLORS.rippleAqua,
    borderRadius: 999,
    borderWidth: 2,
  },
  rippleOne: {
    top: 170,
    left: 32,
    height: 116,
    width: 176,
    transform: [{ rotate: '-15deg' }],
  },
  rippleTwo: {
    top: 330,
    right: 8,
    height: 132,
    width: 212,
    transform: [{ rotate: '12deg' }],
  },
  lotusOne: {
    position: 'absolute',
    top: 42,
    right: -20,
    height: 108,
    width: 148,
    transform: [{ rotate: '-16deg' }],
  },
  lotusTwo: {
    position: 'absolute',
    top: 560,
    left: -32,
    height: 118,
    width: 162,
    transform: [{ rotate: '22deg' }],
  },
  splashBurst: {
    position: 'absolute',
    height: 122,
    width: 166,
  },
  splashBurstOne: {
    top: 128,
    left: 34,
  },
  splashBurstTwo: {
    top: 266,
    right: -12,
  },
  waterMark: {
    position: 'absolute',
  },
  upperWaterMark: {
    top: 124,
    left: 12,
    height: 118,
    width: 280,
  },
  turnWaterMark: {
    top: 264,
    right: -12,
    height: 170,
    width: 230,
  },
  lowerWaterMark: {
    top: 468,
    left: -12,
    height: 120,
    width: 260,
  },
  orangePopWaterMark: {
    top: 492,
    right: -32,
    height: 130,
    width: 180,
  },
  orangeExitWaterMark: {
    top: 278,
    left: -8,
    height: 260,
    width: 320,
  },
  scrollLeaf: {
    position: 'absolute',
    top: 12,
    left: 96,
    height: 42,
    width: 28,
  },
  loopLeaf: {
    position: 'absolute',
    top: 0,
  },
  foregroundLotusPad: {
    position: 'absolute',
  },
  foregroundLotusPadLeft: {
    top: 650,
    left: -42,
    height: 88,
    width: 112,
  },
  foregroundLotusPadRight: {
    top: 188,
    right: -54,
    height: 72,
    width: 92,
  },
  foregroundLotusPadBottom: {
    top: 780,
    right: 28,
    height: 52,
    width: 68,
  },
  foregroundLotusPadUpperLeft: {
    top: 260,
    left: -36,
    height: 58,
    width: 74,
  },
  foregroundLotusPadMidRight: {
    top: 470,
    right: -34,
    height: 78,
    width: 98,
  },
  foregroundLotusPadLowerLeft: {
    top: 880,
    left: 18,
    height: 46,
    width: 60,
  },
  waterLines: {
    ...StyleSheet.absoluteFillObject,
  },
});
