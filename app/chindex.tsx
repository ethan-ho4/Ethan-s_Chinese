import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

import { AppScaffold } from '@/components/AppScaffold';
import { ChindexCard } from '@/components/ChindexCard';
import { CHINESE_ENTRIES } from '@/data/chineseEntries';
import { useCollection } from '@/store/collection';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { ChindexCategory } from '@/types';

type FilterOption = 'all' | ChindexCategory;

const FILTER_OPTIONS: { id: FilterOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'animals', label: 'Animals', icon: 'paw' },
];

export default function ChindexScreen() {
  const router = useRouter();
  const { newlyUnlocked } = useLocalSearchParams<{ newlyUnlocked?: string }>();
  const confettiRef = useRef<ConfettiCannon>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const cardPositions = useRef<Record<string, number>>({});
  const gridYOffset = useRef<number>(0);
  const { isLoaded, isUnlocked, unlockedCount, totalChindexEntries, progressPercentage, lockEntry } =
    useCollection();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (newlyUnlocked) {
      const unlockedEntry = CHINESE_ENTRIES.find((e) => e.id === newlyUnlocked);
      if (unlockedEntry?.chindexCategory) {
        setFilter(unlockedEntry.chindexCategory);
      } else {
        setFilter('all');
      }
      setHighlightedId(newlyUnlocked);
      
      setTimeout(() => {
        const cardY = cardPositions.current[newlyUnlocked];
        if (cardY !== undefined && scrollViewRef.current) {
          const scrollY = gridYOffset.current + cardY - 100;
          scrollViewRef.current.scrollTo({ y: Math.max(0, scrollY), animated: true });
        }
      }, 400);
      
      setTimeout(() => {
        confettiRef.current?.start();
      }, 1100);
      
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked]);

  const chindexEntries = useMemo(() => {
    const entries = CHINESE_ENTRIES.filter((entry) => entry.isChindexEntry);

    if (filter === 'all') return entries;

    return entries.filter((entry) => entry.chindexCategory === filter);
  }, [filter]);

  const filteredUnlockedCount = useMemo(() => {
    return chindexEntries.filter((entry) => isUnlocked(entry.id)).length;
  }, [chindexEntries, isUnlocked]);

  const navigateToCapture = () => {
    router.push('/capture');
  };

  const navigateToWordDetail = (entryId: string) => {
    router.push({ pathname: '/word/[id]', params: { id: entryId } });
  };

  return (
    <View style={styles.screenContainer}>
      <AppScaffold
        eyebrow="Chindex"
        title="Chinese Word Collection"
        subtitle="Discover and collect Chinese vocabulary by photographing real-world objects."
        scrollViewRef={scrollViewRef}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Back to today</Text>
        </TouchableOpacity>

        {!isLoaded ? (
          <View style={styles.loading}>
            <ActivityIndicator color={COLORS.lotusGold} />
          </View>
        ) : (
          <>
            <View style={[styles.progressCard, SHADOWS.seal]}>
              <View style={styles.progressHeader}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>Collection Progress</Text>
                  <Text style={styles.progressCount}>
                    {unlockedCount} / {totalChindexEntries}
                  </Text>
                </View>
                <View style={styles.percentageBadge}>
                  <Text style={styles.percentageText}>{progressPercentage}%</Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={navigateToCapture}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={20} color={COLORS.warmWhite} />
                <Text style={styles.captureButtonText}>Capture to Discover</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterRow}>
              {FILTER_OPTIONS.map((option) => {
                const isSelected = filter === option.id;
                const count =
                  option.id === 'all'
                    ? totalChindexEntries
                    : CHINESE_ENTRIES.filter(
                        (e) => e.isChindexEntry && e.chindexCategory === option.id
                      ).length;

                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.filterChip, isSelected && styles.selectedFilterChip]}
                    onPress={() => setFilter(option.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={option.icon}
                      size={14}
                      color={isSelected ? COLORS.warmWhite : COLORS.textSecondary}
                    />
                    <Text style={[styles.filterLabel, isSelected && styles.selectedFilterLabel]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.filterCount, isSelected && styles.selectedFilterCount]}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filter === 'all' ? 'All Words' : filter === 'food' ? 'Food' : 'Animals'}
              </Text>
              <Text style={styles.sectionCount}>
                {filteredUnlockedCount} / {chindexEntries.length} discovered
              </Text>
            </View>

            <View
              style={styles.grid}
              onLayout={(e) => {
                gridYOffset.current = e.nativeEvent.layout.y;
              }}
            >
              {chindexEntries.map((entry) => {
                const unlocked = isUnlocked(entry.id);
                const isHighlighted = entry.id === highlightedId;

                return (
                  <View
                    key={entry.id}
                    style={styles.gridItem}
                    onLayout={(e) => {
                      cardPositions.current[entry.id] = e.nativeEvent.layout.y;
                    }}
                  >
                    <ChindexCard
                      entry={entry}
                      isUnlocked={unlocked}
                      isHighlighted={isHighlighted}
                      onPress={unlocked ? () => navigateToWordDetail(entry.id) : navigateToCapture}
                      onUndiscover={unlocked ? () => lockEntry(entry.id) : undefined}
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}
      </AppScaffold>
      {newlyUnlocked && (
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: 200, y: -20 }}
          autoStart={false}
          fadeOut
          fallSpeed={2500}
          colors={[COLORS.lotusGold, COLORS.koiOrange, COLORS.lotusLeafGreen, '#FFD700', '#FFA500']}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  loading: {
    alignItems: 'center',
    minHeight: 260,
    justifyContent: 'center',
  },
  progressCard: {
    backgroundColor: COLORS.surfacePondStrong,
    borderColor: 'rgba(216,182,90,0.3)',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    gap: SPACING.md,
    overflow: 'hidden',
    padding: SPACING.md,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressInfo: {
    gap: 2,
  },
  progressTitle: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  progressCount: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  percentageBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.lotusGold,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  percentageText: {
    color: COLORS.inkBlack,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  progressBarBg: {
    backgroundColor: 'rgba(14,90,96,0.2)',
    borderRadius: RADIUS.full,
    height: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: COLORS.lotusLeafGreen,
    borderRadius: RADIUS.full,
    height: '100%',
  },
  captureButton: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.75)',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  captureButtonText: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.75)',
  },
  filterLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  selectedFilterLabel: {
    color: COLORS.warmWhite,
  },
  filterCount: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  selectedFilterCount: {
    color: 'rgba(255,255,255,0.7)',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  sectionCount: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginHorizontal: -2,
  },
  gridItem: {
    width: '48%',
  },
});
