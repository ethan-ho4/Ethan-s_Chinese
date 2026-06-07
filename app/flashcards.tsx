import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppScaffold } from '@/components/AppScaffold';
import { Flashcard } from '@/components/Flashcard';
import { CHINESE_ENTRIES, TOPIC_GROUPS } from '@/data/chineseEntries';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SPACING } from '@/theme';
import { EntryTopic } from '@/types';

export default function FlashcardsScreen() {
  const router = useRouter();
  const { isLoaded, selectedTopic, setSelectedTopic } = usePreferences();
  const [cardIndex, setCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const topicEntries = useMemo(
    () => CHINESE_ENTRIES.filter((entry) => entry.topic === selectedTopic),
    [selectedTopic],
  );
  const currentEntry = topicEntries[cardIndex] ?? topicEntries[0];

  useEffect(() => {
    setCardIndex(0);
    setIsRevealed(false);
  }, [selectedTopic]);

  const selectTopic = async (topic: EntryTopic) => {
    await setSelectedTopic(topic);
  };

  const goPrevious = () => {
    setIsRevealed(false);
    setCardIndex((current) => (current - 1 + topicEntries.length) % topicEntries.length);
  };

  const goNext = () => {
    setIsRevealed(false);
    setCardIndex((current) => (current + 1) % topicEntries.length);
  };

  return (
    <AppScaffold
      eyebrow="Flashcards"
      title="Practice Mandarin by topic."
      subtitle="Choose a topic, listen to the pronunciation, then tap the card to reveal the meaning."
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
        <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
        <Text style={styles.backText}>Back to today</Text>
      </TouchableOpacity>

      {!isLoaded || !currentEntry ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.lotusGold} />
        </View>
      ) : (
        <>
          <View style={styles.topicGrid}>
            {TOPIC_GROUPS.map((topic) => {
              const isSelected = topic.id === selectedTopic;

              return (
                <TouchableOpacity
                  key={topic.id}
                  style={[styles.topicChip, isSelected && styles.selectedTopicChip]}
                  onPress={() => selectTopic(topic.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.topicLabel, isSelected && styles.selectedTopicLabel]}>
                    {topic.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Flashcard
            entry={currentEntry}
            isRevealed={isRevealed}
            onToggleReveal={() => setIsRevealed((value) => !value)}
          />

          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton} onPress={goPrevious} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
              <Text style={styles.controlText}>Previous</Text>
            </TouchableOpacity>
            <Text style={styles.progress}>
              {cardIndex + 1} / {topicEntries.length}
            </Text>
            <TouchableOpacity style={styles.controlButton} onPress={goNext} activeOpacity={0.8}>
              <Text style={styles.controlText}>Next</Text>
              <Ionicons name="chevron-forward" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
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
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  topicChip: {
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
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
    fontSize: 14,
  },
  selectedTopicLabel: {
    color: COLORS.warmWhite,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  controlText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  progress: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
