import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, FONTS, RADIUS, SPACING } from '@/theme';

type SentenceTileProps = {
  pinyin: string;
  token: string;
  englishGloss?: string;
  showGloss?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  isActive?: boolean;
};

export function SentenceTile({
  pinyin,
  token,
  englishGloss,
  showGloss,
  onPress,
  onLongPress,
  disabled,
  isActive,
}: SentenceTileProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={120}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.tile,
        showGloss && styles.tileWithGloss,
        isActive && styles.tileActive,
      ]}
    >
      <Text style={styles.pinyin} numberOfLines={1}>
        {pinyin}
      </Text>
      <Text style={styles.token}>{token}</Text>
      {showGloss && englishGloss ? (
        <Text style={styles.gloss} numberOfLines={1}>
          {englishGloss}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export function EmptySlot() {
  return <View style={styles.emptySlot} />;
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePondStrong,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    flexShrink: 0,
    justifyContent: 'center',
    marginRight: SPACING.sm,
    minHeight: 64,
    minWidth: 52,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  tileWithGloss: {
    minHeight: 80,
    paddingBottom: SPACING.xs,
  },
  tileActive: {
    backgroundColor: 'rgba(232,176,93,0.35)',
    borderColor: COLORS.lotusGold,
    elevation: 6,
    shadowColor: COLORS.inkBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  pinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 11,
    marginBottom: 2,
    maxWidth: 80,
    textAlign: 'center',
  },
  token: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  gloss: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.medium,
    fontSize: 12,
    marginTop: 2,
    maxWidth: 72,
    textAlign: 'center',
  },
  emptySlot: {
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    flexShrink: 0,
    marginRight: SPACING.sm,
    minHeight: 64,
    minWidth: 52,
    opacity: 0.7,
  },
});
