import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

import { AppScaffold } from '@/components/AppScaffold';
import { ChindexCard } from '@/components/ChindexCard';
import { CHINESE_ENTRIES, TOPIC_GROUPS } from '@/data/chineseEntries';
import { useCollection } from '@/store/collection';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { EntryTopic, HskLevel } from '@/types';

type FilterMode = 'hsk' | 'topic';
type HskFilter = 'all' | HskLevel;
type TopicFilter = 'all' | EntryTopic;

const ENTRY_TOPICS: EntryTopic[] = [
  'numbers',
  'time',
  'people',
  'food',
  'transport',
  'places',
  'shopping',
  'weather',
  'body',
  'home',
  'nature',
  'actions',
  'descriptors',
  'grammar',
];

function isEntryTopic(value: string | undefined): value is EntryTopic {
  return ENTRY_TOPICS.includes(value as EntryTopic);
}

const HSK_OPTIONS: { id: HskFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 1, label: 'HSK 1' },
  { id: 2, label: 'HSK 2' },
  { id: 3, label: 'HSK 3' },
];

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

export default function ChindexScreen() {
  const router = useRouter();
  const { newlyUnlocked, topic } = useLocalSearchParams<{
    newlyUnlocked?: string;
    topic?: string;
  }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const cardPositions = useRef<Record<string, number>>({});
  const gridYOffset = useRef<number>(0);
  const { isLoaded, isUnlocked, unlockedCount, totalChindexEntries, progressPercentage, lockEntry } =
    useCollection();
  const [filterMode, setFilterMode] = useState<FilterMode>('hsk');
  const [hskFilter, setHskFilter] = useState<HskFilter>('all');
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('all');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isEntryTopic(topic)) {
      setFilterMode('topic');
      setTopicFilter(topic);
    }
  }, [topic]);

  useEffect(() => {
    if (!newlyUnlocked) return;

    const unlockedIds = newlyUnlocked.split(',').filter(Boolean);
    if (unlockedIds.length === 0) return;

    if (unlockedIds.length === 1 && !isEntryTopic(topic)) {
      const unlockedEntry = CHINESE_ENTRIES.find((e) => e.id === unlockedIds[0]);
      if (unlockedEntry) {
        setFilterMode('hsk');
        setHskFilter(unlockedEntry.hskLevel);
      }
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timeouts.push(id);
    };

    const INITIAL_DELAY = 300;
    const WORD_DURATION = 750;
    const SCROLL_OFFSET = 150;

    const scrollToCard = (id: string) => {
      const cardY = cardPositions.current[id];
      if (cardY !== undefined && scrollViewRef.current) {
        const scrollY = gridYOffset.current + cardY - 100;
        scrollViewRef.current.scrollTo({ y: Math.max(0, scrollY), animated: true });
      }
    };

    unlockedIds.forEach((id, index) => {
      const base = INITIAL_DELAY + index * WORD_DURATION;

      schedule(() => setHighlightedId(id), base);
      schedule(() => scrollToCard(id), base + SCROLL_OFFSET);
    });

    const chainEnd = INITIAL_DELAY + unlockedIds.length * WORD_DURATION;

    schedule(() => setShowConfetti(true), chainEnd);
    schedule(() => setHighlightedId(null), chainEnd + 300);

    return () => {
      timeouts.forEach(clearTimeout);
      setShowConfetti(false);
    };
  }, [newlyUnlocked, topic]);

  const chindexEntries = useMemo(() => {
    const entries = CHINESE_ENTRIES.filter((entry) => entry.isChindexEntry);

    if (filterMode === 'hsk') {
      if (hskFilter === 'all') return entries;
      return entries.filter((entry) => entry.hskLevel === hskFilter);
    } else {
      if (topicFilter === 'all') return entries;
      return entries.filter((entry) => entry.topic === topicFilter);
    }
  }, [filterMode, hskFilter, topicFilter]);

  const filteredUnlockedCount = useMemo(() => {
    return chindexEntries.filter((entry) => isUnlocked(entry.id)).length;
  }, [chindexEntries, isUnlocked]);

  const navigateToCapture = () => {
    router.push('/capture');
  };

  const navigateToWordDetail = (entryId: string) => {
    router.push({ pathname: '/word/[id]', params: { id: entryId } });
  };

  const getFilterLabel = () => {
    if (filterMode === 'hsk') {
      if (hskFilter === 'all') return 'All Words';
      return `HSK ${hskFilter}`;
    } else {
      if (topicFilter === 'all') return 'All Topics';
      const topic = TOPIC_GROUPS.find((t) => t.id === topicFilter);
      return topic?.label || topicFilter;
    }
  };

  return (
    <View style={styles.screenContainer}>
      <AppScaffold
        eyebrow="Chindex"
        title="Chinese Word Collection"
        subtitle="Discover and collect HSK vocabulary by photographing real-world objects."
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

            {/* Filter Mode Toggle */}
            <View style={styles.filterModeRow}>
              <TouchableOpacity
                style={[styles.filterModeButton, filterMode === 'hsk' && styles.filterModeActive]}
                onPress={() => setFilterMode('hsk')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="school"
                  size={16}
                  color={filterMode === 'hsk' ? COLORS.warmWhite : COLORS.textSecondary}
                />
                <Text
                  style={[styles.filterModeText, filterMode === 'hsk' && styles.filterModeTextActive]}
                >
                  By HSK Level
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterModeButton, filterMode === 'topic' && styles.filterModeActive]}
                onPress={() => setFilterMode('topic')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="apps"
                  size={16}
                  color={filterMode === 'topic' ? COLORS.warmWhite : COLORS.textSecondary}
                />
                <Text
                  style={[styles.filterModeText, filterMode === 'topic' && styles.filterModeTextActive]}
                >
                  By Topic
                </Text>
              </TouchableOpacity>
            </View>

            {/* HSK Level Filters */}
            {filterMode === 'hsk' && (
              <View style={styles.filterRow}>
                {HSK_OPTIONS.map((option) => {
                  const isSelected = hskFilter === option.id;
                  const count =
                    option.id === 'all'
                      ? totalChindexEntries
                      : CHINESE_ENTRIES.filter((e) => e.isChindexEntry && e.hskLevel === option.id)
                          .length;

                  return (
                    <TouchableOpacity
                      key={String(option.id)}
                      style={[styles.filterChip, isSelected && styles.selectedFilterChip]}
                      onPress={() => setHskFilter(option.id)}
                      activeOpacity={0.8}
                    >
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
            )}

            {/* Topic Filters */}
            {filterMode === 'topic' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.topicScrollView}
                contentContainerStyle={styles.topicScrollContent}
              >
                <TouchableOpacity
                  style={[styles.topicChip, topicFilter === 'all' && styles.selectedTopicChip]}
                  onPress={() => setTopicFilter('all')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="grid"
                    size={14}
                    color={topicFilter === 'all' ? COLORS.warmWhite : COLORS.textSecondary}
                  />
                  <Text
                    style={[styles.topicLabel, topicFilter === 'all' && styles.selectedTopicLabel]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {TOPIC_GROUPS.map((topic) => {
                  const isSelected = topicFilter === topic.id;
                  const count = CHINESE_ENTRIES.filter(
                    (e) => e.isChindexEntry && e.topic === topic.id
                  ).length;

                  return (
                    <TouchableOpacity
                      key={topic.id}
                      style={[styles.topicChip, isSelected && styles.selectedTopicChip]}
                      onPress={() => setTopicFilter(topic.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={TOPIC_ICONS[topic.id]}
                        size={14}
                        color={isSelected ? COLORS.warmWhite : COLORS.textSecondary}
                      />
                      <Text style={[styles.topicLabel, isSelected && styles.selectedTopicLabel]}>
                        {topic.label}
                      </Text>
                      <Text style={[styles.topicCount, isSelected && styles.selectedTopicCount]}>
                        {count}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{getFilterLabel()}</Text>
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
      {showConfetti && (
        <ConfettiCannon
          count={150}
          origin={{ x: 200, y: -20 }}
          autoStart
          fadeOut
          fallSpeed={2500}
          colors={[COLORS.lotusGold, COLORS.koiOrange, COLORS.lotusLeafGreen, '#FFD700', '#FFA500']}
          onAnimationEnd={() => setShowConfetti(false)}
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
  filterModeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterModeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  filterModeActive: {
    backgroundColor: COLORS.darkJadeWater,
    borderColor: COLORS.lotusLeafGreen,
  },
  filterModeText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  filterModeTextActive: {
    color: COLORS.warmWhite,
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
  topicScrollView: {
    marginHorizontal: -SPACING.lg,
  },
  topicScrollContent: {
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  topicChip: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectedTopicChip: {
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.75)',
  },
  topicLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  selectedTopicLabel: {
    color: COLORS.warmWhite,
  },
  topicCount: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  selectedTopicCount: {
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
