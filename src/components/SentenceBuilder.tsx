import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptySlot, SentenceTile } from '@/components/SentenceTile';
import { SentenceTileItem } from '@/services/sentenceExercise';
import { COLORS, FONTS, RADIUS, SPACING } from '@/theme';

type SentenceBuilderProps = {
  bank: SentenceTileItem[];
  answer: SentenceTileItem[];
  slotCount: number;
  showBankGlosses: boolean;
  disabled?: boolean;
  onBankTilePress: (id: string) => void;
  onAnswerTilePress: (id: string) => void;
};

export function SentenceBuilder({
  bank,
  answer,
  slotCount,
  showBankGlosses,
  disabled,
  onBankTilePress,
  onAnswerTilePress,
}: SentenceBuilderProps) {
  const answerRow = (
    <View style={styles.answerRow}>
      {Array.from({ length: slotCount }, (_, index) => {
        const tile = answer[index];
        if (tile) {
          return (
            <SentenceTile
              key={tile.id}
              pinyin={tile.pinyin}
              token={tile.token}
              onPress={() => onAnswerTilePress(tile.id)}
              disabled={disabled}
            />
          );
        }
        return <EmptySlot key={`slot-${index}`} />;
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Word options</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.bankContent,
            showBankGlosses && styles.bankContentWithGloss,
          ]}
        >
          {bank.length === 0 ? (
            <Text style={styles.bankEmpty}>All words placed</Text>
          ) : (
            bank.map((item) => (
              <SentenceTile
                key={item.id}
                pinyin={item.pinyin}
                token={item.token}
                englishGloss={item.english}
                showGloss={showBankGlosses}
                onPress={() => onBankTilePress(item.id)}
                disabled={disabled}
              />
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Your sentence</Text>
        <View style={styles.answerZone}>
          {slotCount > 4 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {answerRow}
            </ScrollView>
          ) : (
            answerRow
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  section: {
    flexShrink: 1,
    gap: SPACING.xs,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bankContent: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 76,
    paddingVertical: SPACING.xs,
  },
  bankContentWithGloss: {
    minHeight: 92,
  },
  bankEmpty: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 14,
    paddingVertical: SPACING.sm,
  },
  answerZone: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    minHeight: 88,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  answerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
});
