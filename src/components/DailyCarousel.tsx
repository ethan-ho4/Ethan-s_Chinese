import { useFocusEffect } from '@react-navigation/native';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { COLORS, FONTS, SPACING } from '@/theme';

const AUTO_ROTATE_MS = 20_000;
const SLIDE_COUNT = 2;

type DailyCarouselProps = {
  wordSlide: ReactNode;
  proverbSlide: ReactNode;
};

export function DailyCarousel({ wordSlide, proverbSlide }: DailyCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const slideWidth = screenWidth - SPACING.lg * 2;
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = [
    { key: 'word', node: wordSlide },
    { key: 'proverb', node: proverbSlide },
  ];

  const clearAutoRotate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      flatListRef.current?.scrollToOffset({
        offset: index * slideWidth,
        animated,
      });
      activeIndexRef.current = index;
      setActiveIndex(index);
    },
    [slideWidth],
  );

  const startAutoRotate = useCallback(() => {
    clearAutoRotate();
    intervalRef.current = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % SLIDE_COUNT;
      scrollToIndex(nextIndex);
    }, AUTO_ROTATE_MS);
  }, [clearAutoRotate, scrollToIndex]);

  useFocusEffect(
    useCallback(() => {
      startAutoRotate();
      return clearAutoRotate;
    }, [startAutoRotate, clearAutoRotate]),
  );

  useEffect(() => {
    return clearAutoRotate;
  }, [clearAutoRotate]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    const clamped = Math.max(0, Math.min(SLIDE_COUNT - 1, index));
    activeIndexRef.current = clamped;
    setActiveIndex(clamped);
    startAutoRotate();
  };

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: slideWidth }]}>{item.node}</View>
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
        onScrollToIndexFailed={() => {
          flatListRef.current?.scrollToOffset({
            offset: activeIndexRef.current * slideWidth,
            animated: false,
          });
        }}
      />
      <View style={styles.dots}>
        <View style={[styles.dot, activeIndex === 0 && styles.dotActive]} />
        <Text style={[styles.dotLabel, activeIndex === 0 && styles.dotLabelActive]}>Word</Text>
        <Text style={styles.dotSeparator}>·</Text>
        <View style={[styles.dot, activeIndex === 1 && styles.dotActive]} />
        <Text style={[styles.dotLabel, activeIndex === 1 && styles.dotLabelActive]}>Proverb</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: SPACING.sm,
  },
  slide: {
    flexShrink: 0,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingTop: 4,
  },
  dot: {
    backgroundColor: 'rgba(255,248,234,0.35)',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: COLORS.lotusGold,
    width: 20,
  },
  dotLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  dotLabelActive: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
  },
  dotSeparator: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 13,
    marginHorizontal: 2,
  },
});
