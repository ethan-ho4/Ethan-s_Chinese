import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { SentenceBuilder } from '@/components/SentenceBuilder';
import {
  createExerciseTiles,
  getDisplayTokens,
  getExercisesForHsk,
  isCorrectOrder,
  SentenceTileItem,
  tilesToTokens,
} from '@/services/sentenceExercise';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { HskLevel } from '@/types';

type Phase = 'setup' | 'practice' | 'complete';
type CheckState = 'idle' | 'correct' | 'wrong';

const HSK_OPTIONS: { level: HskLevel; label: string; description: string }[] = [
  { level: 1, label: 'HSK 1', description: 'Short beginner sentences with basic words.' },
  { level: 2, label: 'HSK 2', description: 'Everyday phrases with more vocabulary.' },
  { level: 3, label: 'HSK 3', description: 'Longer patterns and common grammar.' },
];

const SUCCESS_MESSAGES = [
  'Awesome!',
  'Great job!',
  'You got it!',
  'Excellent!',
] as const;

function pickSuccessMessage() {
  return SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
}

export default function SentencesScreen() {
  const router = useRouter();
  const { isLoaded, script } = usePreferences();
  const [phase, setPhase] = useState<Phase>('setup');
  const [sessionLevel, setSessionLevel] = useState<HskLevel>(1);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [bankTiles, setBankTiles] = useState<SentenceTileItem[]>([]);
  const [answerTiles, setAnswerTiles] = useState<SentenceTileItem[]>([]);
  const [initialBankOrder, setInitialBankOrder] = useState<SentenceTileItem[]>([]);
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [successMessage, setSuccessMessage] = useState(() => pickSuccessMessage());
  const [isHskPickerOpen, setIsHskPickerOpen] = useState(false);

  const levelExercises = useMemo(() => getExercisesForHsk(sessionLevel), [sessionLevel]);
  const practiceExercises = useMemo(
    () => (phase === 'practice' || phase === 'complete' ? levelExercises : []),
    [phase, levelExercises],
  );
  const currentExercise = practiceExercises[sentenceIndex];
  const sessionLevelLabel =
    HSK_OPTIONS.find((option) => option.level === sessionLevel)?.label ?? `HSK ${sessionLevel}`;
  const isLastSentence = sentenceIndex === practiceExercises.length - 1;
  const slotCount = currentExercise ? getDisplayTokens(currentExercise, script).length : 0;
  const isAnswerComplete = answerTiles.length === slotCount && slotCount > 0;

  useEffect(() => {
    if (phase === 'practice' && currentExercise) {
      const tiles = createExerciseTiles(currentExercise, script);
      setInitialBankOrder(tiles);
      setBankTiles(tiles);
      setAnswerTiles([]);
      setCheckState('idle');
    }
  }, [phase, sentenceIndex, currentExercise, script]);

  const startPractice = () => {
    setSentenceIndex(0);
    setCheckState('idle');
    setPhase('practice');
  };

  const exitPractice = () => {
    setSentenceIndex(0);
    setCheckState('idle');
    setPhase('setup');
  };

  const practiceAgain = () => {
    setSentenceIndex(0);
    setCheckState('idle');
    setPhase('setup');
  };

  const resetCheckState = () => {
    if (checkState !== 'idle') {
      setCheckState('idle');
    }
  };

  const handleBankPress = (id: string) => {
    if (checkState === 'correct') return;
    const tile = bankTiles.find((item) => item.id === id);
    if (!tile) return;
    resetCheckState();
    setBankTiles((current) => current.filter((item) => item.id !== id));
    setAnswerTiles((current) => [...current, tile]);
  };

  const handleAnswerPress = (id: string) => {
    if (checkState === 'correct') return;
    const tile = answerTiles.find((item) => item.id === id);
    if (!tile) return;
    resetCheckState();
    setAnswerTiles((current) => current.filter((item) => item.id !== id));
    setBankTiles((current) => [...current, tile]);
  };

  const handleCheck = () => {
    if (!currentExercise || checkState === 'correct' || !isAnswerComplete) return;
    if (isCorrectOrder(tilesToTokens(answerTiles), currentExercise, script)) {
      setSuccessMessage(pickSuccessMessage());
      setCheckState('correct');
    } else {
      setAnswerTiles([]);
      setBankTiles(initialBankOrder);
      setCheckState('wrong');
    }
  };

  const goNext = () => {
    if (isLastSentence) {
      setPhase('complete');
      return;
    }
    setSentenceIndex((current) => current + 1);
  };

  const scaffoldTitle =
    phase === 'practice' ? 'Sentences' : 'Build Mandarin sentences.';
  const subtitle =
    phase === 'setup'
      ? 'Choose an HSK level, then tap words to build each sentence.'
      : phase === 'practice'
        ? 'Tap words to build the sentence.'
        : 'Great work! You finished the sentence deck.';

  return (
    <AppScaffold
      eyebrow="Sentence Creation"
      title={scaffoldTitle}
      subtitle={subtitle}
      scrollEnabled={phase !== 'practice'}
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
            style={styles.levelSelector}
            onPress={() => setIsHskPickerOpen(true)}
            activeOpacity={0.85}
          >
            <View style={styles.levelSelectorIcon}>
              <Ionicons name="school" size={22} color={COLORS.koiOrange} />
            </View>
            <View style={styles.levelSelectorText}>
              <Text style={styles.levelSelectorLabel}>{sessionLevelLabel}</Text>
              <Text style={styles.levelSelectorMeta}>
                {levelExercises.length}{' '}
                {levelExercises.length === 1 ? 'sentence' : 'sentences'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.startButton,
              SHADOWS.seal,
              levelExercises.length === 0 && styles.disabledButton,
            ]}
            onPress={startPractice}
            disabled={levelExercises.length === 0}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={20} color={COLORS.warmWhite} />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>

          <Modal
            visible={isHskPickerOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsHskPickerOpen(false)}
          >
            <View style={styles.modalBackdrop}>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setIsHskPickerOpen(false)}
              />
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>Choose HSK level</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {HSK_OPTIONS.map((option) => {
                    const isSelected = option.level === sessionLevel;
                    const count = getExercisesForHsk(option.level).length;

                    return (
                      <TouchableOpacity
                        key={option.level}
                        style={[styles.modalRow, isSelected && styles.modalRowSelected]}
                        onPress={() => {
                          setSessionLevel(option.level);
                          setIsHskPickerOpen(false);
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
                            name="school"
                            size={18}
                            color={isSelected ? COLORS.warmWhite : COLORS.koiOrange}
                          />
                        </View>
                        <View style={styles.modalRowText}>
                          <Text
                            style={[
                              styles.modalRowLabel,
                              isSelected && styles.modalRowLabelSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                          <Text
                            style={[
                              styles.modalRowDescription,
                              isSelected && styles.modalRowDescriptionSelected,
                            ]}
                          >
                            {option.description}
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
      ) : phase === 'practice' && currentExercise ? (
        <View style={styles.practiceBody}>
          <View style={styles.practiceHeader}>
            <View>
              <Text style={styles.practiceEyebrow}>Current level</Text>
              <Text style={styles.practiceTitle}>{sessionLevelLabel}</Text>
            </View>
            <TouchableOpacity style={styles.exitButton} onPress={exitPractice} activeOpacity={0.8}>
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.promptCardCompact}>
            <Text style={styles.promptLabel}>Build this sentence</Text>
            <Text style={styles.promptEnglishCompact}>{currentExercise.english}</Text>
            {checkState === 'correct' ? (
              <Text style={styles.promptPinyin}>{currentExercise.pinyin}</Text>
            ) : null}
          </View>

          <SentenceBuilder
            bank={bankTiles}
            answer={answerTiles}
            slotCount={slotCount}
            showBankGlosses={checkState === 'wrong'}
            disabled={checkState === 'correct'}
            onBankTilePress={handleBankPress}
            onAnswerTilePress={handleAnswerPress}
          />

          {checkState === 'correct' ? (
            <View style={[styles.feedbackCorrect, SHADOWS.seal]}>
              <Ionicons name="checkmark-circle" size={30} color={COLORS.lotusLeafGreen} />
              <View style={styles.feedbackCorrectCopy}>
                <Text style={styles.feedbackCorrectText}>{successMessage}</Text>
              </View>
            </View>
          ) : null}
          {checkState === 'wrong' ? (
            <View style={styles.feedbackWrong}>
              <Ionicons name="refresh" size={18} color={COLORS.koiOrange} />
              <Text style={styles.feedbackWrongText}>
                Not quite — words reset with English hints. Try again.
              </Text>
            </View>
          ) : null}

          <View style={styles.controlsCompact}>
            <Text style={styles.progress}>
              {sentenceIndex + 1} / {practiceExercises.length}
            </Text>
            {checkState === 'correct' ? (
              <TouchableOpacity
                style={[styles.primaryAction, SHADOWS.seal]}
                onPress={goNext}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionText}>
                  {isLastSentence ? 'Finish' : 'Next'}
                </Text>
                <Ionicons
                  name={isLastSentence ? 'checkmark' : 'chevron-forward'}
                  size={20}
                  color={COLORS.warmWhite}
                />
              </TouchableOpacity>
            ) : isAnswerComplete ? (
              <TouchableOpacity
                style={[styles.primaryAction, SHADOWS.seal]}
                onPress={handleCheck}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionText}>Check</Text>
                <Ionicons name="checkmark" size={20} color={COLORS.warmWhite} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.completeCard}>
          <View style={styles.completeIcon}>
            <Ionicons name="checkmark-circle" size={56} color={COLORS.lotusLeafGreen} />
          </View>
          <Text style={styles.completeTitle}>Deck complete!</Text>
          <Text style={styles.completeMessage}>
            You built all {practiceExercises.length} sentences for {sessionLevelLabel}.
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
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionText}>Back home</Text>
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
  levelSelector: {
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
  levelSelectorIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(232,176,93,0.15)',
    borderRadius: RADIUS.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  levelSelectorText: {
    flex: 1,
    gap: 2,
  },
  levelSelectorLabel: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  levelSelectorMeta: {
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
    marginTop: SPACING.md,
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
  practiceBody: {
    flex: 1,
    gap: SPACING.sm,
    justifyContent: 'space-between',
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
  promptCard: {
    backgroundColor: COLORS.surfacePondStrong,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    borderWidth: 1.2,
    gap: SPACING.sm,
    padding: SPACING.lg,
  },
  promptCardCompact: {
    backgroundColor: COLORS.surfacePondStrong,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    borderWidth: 1.2,
    gap: 4,
    padding: SPACING.md,
  },
  promptLabel: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  promptEnglish: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 22,
    lineHeight: 30,
  },
  promptEnglishCompact: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  promptPinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 16,
    marginTop: 4,
  },
  feedbackCorrect: {
    alignItems: 'center',
    backgroundColor: 'rgba(126,159,61,0.18)',
    borderColor: 'rgba(126,159,61,0.5)',
    borderRadius: RADIUS.lg,
    borderWidth: 1.4,
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  feedbackCorrectCopy: {
    flex: 1,
    gap: 0,
  },
  feedbackCorrectText: {
    color: COLORS.lotusLeafGreen,
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 28,
  },
  feedbackWrong: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  feedbackWrongText: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 14,
    textAlign: 'center',
  },
  controls: {
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  controlsCompact: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progress: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minWidth: 160,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
  },
  primaryActionText: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 16,
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
});
