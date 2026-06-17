import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppScaffold } from '@/components/AppScaffold';
import { Flashcard } from '@/components/Flashcard';
import { CHINESE_ENTRIES, TOPIC_GROUPS } from '@/data/chineseEntries';
import { findEntriesByTopic, useCollection } from '@/store/collection';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { EntryTopic } from '@/types';

type Phase = 'setup' | 'practice' | 'complete';

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

export default function FlashcardsScreen() {
  const router = useRouter();
  const { isLoaded, unlockMultiple } = useCollection();
  const [phase, setPhase] = useState<Phase>('setup');
  const [sessionTopic, setSessionTopic] = useState<EntryTopic>('numbers');
  const [cardIndex, setCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isTopicPickerOpen, setIsTopicPickerOpen] = useState(false);

  const setupEntries = useMemo(
    () => CHINESE_ENTRIES.filter((entry) => entry.topic === sessionTopic),
    [sessionTopic],
  );

  const topicEntries = useMemo(
    () => (phase === 'practice' || phase === 'complete' ? setupEntries : []),
    [phase, setupEntries],
  );

  const currentEntry = topicEntries[cardIndex];
  const sessionTopicLabel =
    TOPIC_GROUPS.find((topic) => topic.id === sessionTopic)?.label ?? sessionTopic;
  const isLastCard = cardIndex === topicEntries.length - 1;
  const isFirstCard = cardIndex === 0;

  const startPractice = () => {
    setCardIndex(0);
    setIsRevealed(false);
    setPhase('practice');
  };

  const exitPractice = () => {
    setCardIndex(0);
    setIsRevealed(false);
    setPhase('setup');
  };

  const finishDeck = async () => {
    const newIds = await unlockMultiple(findEntriesByTopic(sessionTopic));
    if (newIds.length > 0) {
      router.push({
        pathname: '/chindex',
        params: {
          topic: sessionTopic,
          newlyUnlocked: newIds.join(','),
        },
      });
      return;
    }
    setPhase('complete');
  };

  const goPrevious = () => {
    if (isFirstCard) return;
    setIsRevealed(false);
    setCardIndex((current) => current - 1);
  };

  const goNext = () => {
    if (isLastCard) {
      finishDeck();
      return;
    }
    setIsRevealed(false);
    setCardIndex((current) => current + 1);
  };

  const practiceAgain = () => {
    setCardIndex(0);
    setIsRevealed(false);
    setPhase('setup');
  };

  const viewChindex = () => {
    router.push({
      pathname: '/chindex',
      params: { topic: sessionTopic },
    });
  };

  const subtitle =
    phase === 'setup'
      ? 'Tap a topic, then start the deck.'
      : phase === 'practice'
        ? 'Tap the card to reveal the meaning. Finish the deck to add words to your Chindex.'
        : 'Great work! Your progress has been saved.';

  return (
    <AppScaffold
      eyebrow="Flashcards"
      title="Practice Mandarin by topic."
      subtitle={subtitle}
      showHeader={phase !== 'practice'}
    >
      {phase !== 'practice' ? (
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Back to today</Text>
        </TouchableOpacity>
      ) : null}

      {!isLoaded ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.lotusGold} />
        </View>
      ) : phase === 'setup' ? (
        <>
          <TouchableOpacity
            style={styles.topicSelector}
            onPress={() => setIsTopicPickerOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.topicSelectorIcon}>
              <Ionicons name={TOPIC_ICONS[sessionTopic]} size={22} color={COLORS.koiOrange} />
            </View>
            <View style={styles.topicSelectorText}>
              <Text style={styles.topicSelectorLabel}>{sessionTopicLabel}</Text>
              <Text style={styles.topicSelectorMeta}>
                {setupEntries.length} {setupEntries.length === 1 ? 'word' : 'words'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.startButton,
              SHADOWS.seal,
              setupEntries.length === 0 && styles.disabledButton,
            ]}
            onPress={startPractice}
            disabled={setupEntries.length === 0}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={20} color={COLORS.warmWhite} />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>

          <Modal
            visible={isTopicPickerOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsTopicPickerOpen(false)}
          >
            <View style={styles.modalBackdrop}>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setIsTopicPickerOpen(false)}
              />
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>Choose a topic</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {TOPIC_GROUPS.map((topic) => {
                    const isSelected = topic.id === sessionTopic;
                    const count = CHINESE_ENTRIES.filter((entry) => entry.topic === topic.id).length;

                    return (
                      <TouchableOpacity
                        key={topic.id}
                        style={[styles.modalRow, isSelected && styles.modalRowSelected]}
                        onPress={() => {
                          setSessionTopic(topic.id);
                          setIsTopicPickerOpen(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.modalRowIcon,
                            isSelected && styles.modalRowIconSelected,
                          ]}
                        >
                          <Ionicons
                            name={TOPIC_ICONS[topic.id]}
                            size={18}
                            color={isSelected ? COLORS.warmWhite : COLORS.koiOrange}
                          />
                        </View>
                        <View style={styles.modalRowText}>
                          <Text
                            style={[styles.modalRowLabel, isSelected && styles.modalRowLabelSelected]}
                          >
                            {topic.label}
                          </Text>
                          <Text
                            style={[
                              styles.modalRowDescription,
                              isSelected && styles.modalRowDescriptionSelected,
                            ]}
                          >
                            {topic.description}
                          </Text>
                        </View>
                        <Text
                          style={[styles.modalRowCount, isSelected && styles.modalRowCountSelected]}
                        >
                          {count}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </>
      ) : phase === 'practice' && currentEntry ? (
        <>
          <View style={styles.practiceHeader}>
            <View>
              <Text style={styles.practiceEyebrow}>Current deck</Text>
              <Text style={styles.practiceTitle}>{sessionTopicLabel}</Text>
            </View>
            <TouchableOpacity style={styles.exitButton} onPress={exitPractice} activeOpacity={0.8}>
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>

          <Flashcard
            entry={currentEntry}
            isRevealed={isRevealed}
            onToggleReveal={() => setIsRevealed((value) => !value)}
          />

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, isFirstCard && styles.controlButtonDisabled]}
              onPress={goPrevious}
              disabled={isFirstCard}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={isFirstCard ? COLORS.textMuted : COLORS.textPrimary}
              />
              <Text style={[styles.controlText, isFirstCard && styles.controlTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>
            <Text style={styles.progress}>
              {cardIndex + 1} / {topicEntries.length}
            </Text>
            <TouchableOpacity
              style={[styles.controlButton, isLastCard && styles.finishButton]}
              onPress={goNext}
              activeOpacity={0.8}
            >
              <Text style={[styles.controlText, isLastCard && styles.finishButtonText]}>
                {isLastCard ? 'Finish' : 'Next'}
              </Text>
              <Ionicons
                name={isLastCard ? 'checkmark' : 'chevron-forward'}
                size={22}
                color={isLastCard ? COLORS.warmWhite : COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.completeCard}>
          <View style={styles.completeIcon}>
            <Ionicons name="checkmark-circle" size={56} color={COLORS.lotusLeafGreen} />
          </View>
          <Text style={styles.completeTitle}>Deck complete!</Text>
          <Text style={styles.completeMessage}>
            All words in this deck were already in your Chindex.
          </Text>
          <Text style={styles.completeTopic}>
            {sessionTopicLabel} · {topicEntries.length}{' '}
            {topicEntries.length === 1 ? 'word' : 'words'}
          </Text>

          <View style={styles.completeActions}>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={practiceAgain}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryActionText}>Practice again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryAction, SHADOWS.seal]}
              onPress={viewChindex}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionText}>View Chindex</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  topicSelector: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    borderWidth: 1.2,
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  topicSelectorIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(232,176,93,0.15)',
    borderRadius: RADIUS.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  topicSelectorText: {
    flex: 1,
    gap: 2,
  },
  topicSelectorLabel: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  topicSelectorMeta: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.lg,
  },
  modalSheet: {
    backgroundColor: COLORS.surfacePondStrong,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    borderWidth: 1.2,
    maxHeight: '70%',
    padding: SPACING.md,
    width: '100%',
  },
  modalTitle: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalRow: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
  },
  modalRowSelected: {
    backgroundColor: COLORS.sealOrange,
  },
  modalRowIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(232,176,93,0.15)',
    borderRadius: RADIUS.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  modalRowIconSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modalRowText: {
    flex: 1,
    gap: 2,
  },
  modalRowLabel: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  modalRowLabelSelected: {
    color: COLORS.warmWhite,
  },
  modalRowDescription: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  modalRowDescriptionSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  modalRowCount: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  modalRowCountSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  startButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.75)',
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    minWidth: 180,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
  },
  startButtonText: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
  practiceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  practiceEyebrow: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  practiceTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 20,
    marginTop: 2,
  },
  exitButton: {
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  exitButtonText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bold,
    fontSize: 13,
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
  controlButtonDisabled: {
    opacity: 0.45,
  },
  finishButton: {
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.75)',
  },
  controlText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  controlTextDisabled: {
    color: COLORS.textMuted,
  },
  finishButtonText: {
    color: COLORS.warmWhite,
  },
  progress: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  completeCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePondStrong,
    borderColor: 'rgba(126,159,61,0.35)',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    gap: SPACING.md,
    padding: SPACING.xl,
  },
  completeIcon: {
    marginBottom: SPACING.xs,
  },
  completeTitle: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 28,
    textAlign: 'center',
  },
  completeMessage: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  completeTopic: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  completeActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    width: '100%',
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    flex: 1,
    paddingVertical: 14,
  },
  secondaryActionText: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderRadius: RADIUS.md,
    flex: 1,
    paddingVertical: 14,
  },
  primaryActionText: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
