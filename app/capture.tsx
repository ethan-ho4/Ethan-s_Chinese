import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CHINESE_ENTRIES, TOPIC_GROUPS } from '@/data/chineseEntries';
import { getChinese } from '@/services/script';
import { useCollection } from '@/store/collection';
import { usePreferences } from '@/store/preferences';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { ChineseEntry, EntryTopic } from '@/types';

type CaptureState = 'camera' | 'selecting' | 'success';

const TOPIC_ICONS: Record<EntryTopic, string> = {
  numbers: '🔢',
  time: '⏰',
  people: '👥',
  food: '🍎',
  transport: '🚗',
  places: '📍',
  shopping: '🛒',
  weather: '☀️',
  body: '💪',
  home: '🏠',
  nature: '🌿',
  actions: '⚡',
  descriptors: '🎨',
  grammar: '📚',
};

export default function CaptureScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { unlockEntry, isUnlocked } = useCollection();
  const { script } = usePreferences();

  const [captureState, setCaptureState] = useState<CaptureState>('camera');
  const [selectedTopic, setSelectedTopic] = useState<EntryTopic | null>(null);
  const [unlockedEntry, setUnlockedEntry] = useState<ChineseEntry | null>(null);
  const [wasNewUnlock, setWasNewUnlock] = useState(false);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
      });
      setCaptureState('selecting');
    } catch (error) {
      console.error('Photo error:', error);
    }
  };

  const selectWord = async (entry: ChineseEntry) => {
    const wasNew = !isUnlocked(entry.id);
    if (wasNew) {
      await unlockEntry(entry.id);
    }
    setWasNewUnlock(wasNew);
    setUnlockedEntry(entry);
    setCaptureState('success');
  };

  const resetCapture = () => {
    setCaptureState('camera');
    setSelectedTopic(null);
    setUnlockedEntry(null);
    setWasNewUnlock(false);
  };

  const navigateToChindex = () => {
    router.push('/chindex');
  };

  const getTopicEntries = (topic: EntryTopic) => {
    return CHINESE_ENTRIES.filter((e) => e.topic === topic && e.isChindexEntry);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.lotusGold} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionCard}>
          <Ionicons name="camera-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Grant camera access to photograph real-world objects and discover Chinese vocabulary.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (captureState === 'selecting') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.selectingHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={resetCapture}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.warmWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>What did you photograph?</Text>
          <View style={{ width: 44 }} />
        </View>

        {!selectedTopic ? (
          <ScrollView style={styles.topicScrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.selectPrompt}>Choose a category:</Text>
            <View style={styles.topicGrid}>
              {TOPIC_GROUPS.map((topic) => {
                const count = getTopicEntries(topic.id).length;
                const unlockedInTopic = getTopicEntries(topic.id).filter((e) =>
                  isUnlocked(e.id)
                ).length;

                return (
                  <TouchableOpacity
                    key={topic.id}
                    style={styles.topicButton}
                    onPress={() => setSelectedTopic(topic.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.topicEmoji}>{TOPIC_ICONS[topic.id]}</Text>
                    <Text style={styles.topicLabel}>{topic.label}</Text>
                    <Text style={styles.topicCount}>
                      {unlockedInTopic}/{count}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.itemSelection}>
            <TouchableOpacity
              style={styles.backToCategories}
              onPress={() => setSelectedTopic(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={18} color={COLORS.textSecondary} />
              <Text style={styles.backToCategoriesText}>Back to categories</Text>
            </TouchableOpacity>
            <Text style={styles.selectPrompt}>Select a word to unlock:</Text>
            <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
              <View style={styles.itemGrid}>
                {getTopicEntries(selectedTopic).map((entry) => {
                  const alreadyUnlocked = isUnlocked(entry.id);
                  return (
                    <TouchableOpacity
                      key={entry.id}
                      style={[styles.itemButton, alreadyUnlocked && styles.itemButtonUnlocked]}
                      onPress={() => selectWord(entry)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.itemContent}>
                        <Text style={styles.itemMandarin}>{getChinese(entry, script)}</Text>
                        <Text style={styles.itemEnglish}>{entry.english}</Text>
                      </View>
                      {alreadyUnlocked && (
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.lotusLeafGreen} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (captureState === 'success' && unlockedEntry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.resultCard, styles.successCard, SHADOWS.glow]}>
          <View style={styles.resultIcon}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.lotusLeafGreen} />
          </View>
          <Text style={styles.resultTitle}>
            {wasNewUnlock ? 'Word Discovered!' : 'Word Already Unlocked!'}
          </Text>
          <View style={styles.entryRow}>
            <Text style={styles.entryMandarin}>{getChinese(unlockedEntry, script)}</Text>
            <Text style={styles.entryPinyin}>{unlockedEntry.pinyin}</Text>
            <Text style={styles.entryEnglish}>{unlockedEntry.english}</Text>
          </View>
          <Text style={styles.entryLevel}>HSK {unlockedEntry.hskLevel}</Text>
          <View style={styles.resultButtons}>
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={resetCapture}
              activeOpacity={0.8}
            >
              <Text style={styles.tryAgainText}>Capture Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewCollectionButton}
              onPress={navigateToChindex}
              activeOpacity={0.8}
            >
              <Text style={styles.viewCollectionText}>View Collection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={24} color={COLORS.warmWhite} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Capture to Discover</Text>
            <TouchableOpacity
              style={styles.chindexButton}
              onPress={navigateToChindex}
              activeOpacity={0.8}
            >
              <Ionicons name="grid" size={20} color={COLORS.warmWhite} />
            </TouchableOpacity>
          </View>

          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <View style={styles.controls}>
            <Text style={styles.hint}>Take a photo, then select the word</Text>
            <TouchableOpacity
              style={[styles.captureButton, SHADOWS.glow]}
              onPress={takePicture}
              activeOpacity={0.85}
            >
              <View style={styles.captureButtonInner}>
                <Ionicons name="camera" size={32} color={COLORS.warmWhite} />
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.darkJadeWater,
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  selectingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: RADIUS.full,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerTitle: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 18,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  chindexButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: RADIUS.full,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  viewfinder: {
    alignSelf: 'center',
    aspectRatio: 1,
    position: 'relative',
    width: '75%',
  },
  corner: {
    borderColor: COLORS.warmWhite,
    height: 40,
    position: 'absolute',
    width: 40,
  },
  topLeft: {
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderTopLeftRadius: 12,
    left: 0,
    top: 0,
  },
  topRight: {
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderTopRightRadius: 12,
    right: 0,
    top: 0,
  },
  bottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
    bottom: 0,
    right: 0,
  },
  topicScrollView: {
    flex: 1,
    padding: SPACING.lg,
  },
  selectPrompt: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    fontSize: 16,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  topicButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    gap: 4,
    padding: SPACING.md,
    width: '48%',
  },
  topicEmoji: {
    fontSize: 32,
  },
  topicLabel: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  topicCount: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  itemSelection: {
    flex: 1,
    padding: SPACING.lg,
  },
  backToCategories: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: SPACING.md,
  },
  backToCategoriesText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  itemList: {
    flex: 1,
    marginTop: SPACING.md,
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  itemButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  itemButtonUnlocked: {
    backgroundColor: 'rgba(126,159,61,0.15)',
    borderColor: COLORS.lotusLeafGreen,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemMandarin: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  itemEnglish: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  resultCard: {
    alignSelf: 'center',
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
    margin: SPACING.lg,
    marginTop: 'auto',
    marginBottom: 'auto',
    padding: SPACING.lg,
    width: '90%',
  },
  successCard: {
    backgroundColor: COLORS.surfacePondStrong,
    borderColor: COLORS.lotusLeafGreen,
    borderWidth: 2,
  },
  resultIcon: {
    alignItems: 'center',
  },
  resultTitle: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 22,
    textAlign: 'center',
  },
  entryRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(14,90,96,0.1)',
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.sm,
  },
  entryMandarin: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  entryPinyin: {
    color: COLORS.koiOrange,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  entryEnglish: {
    color: COLORS.textOnLightMuted,
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    textAlign: 'right',
  },
  entryLevel: {
    color: COLORS.textOnLightMuted,
    fontFamily: FONTS.medium,
    fontSize: 12,
    textAlign: 'center',
  },
  resultButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  tryAgainButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
    flex: 1,
    paddingVertical: 12,
  },
  tryAgainText: {
    color: COLORS.textOnLight,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  viewCollectionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderRadius: RADIUS.md,
    flex: 1,
    paddingVertical: 12,
  },
  viewCollectionText: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  controls: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  hint: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: RADIUS.full,
    color: COLORS.warmWhite,
    fontFamily: FONTS.medium,
    fontSize: 14,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  captureButton: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderColor: 'rgba(232,176,93,0.75)',
    borderRadius: RADIUS.full,
    borderWidth: 4,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  captureButtonInner: {
    alignItems: 'center',
    backgroundColor: COLORS.koiOrange,
    borderRadius: RADIUS.full,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  permissionCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    margin: SPACING.lg,
    padding: SPACING.xl,
  },
  permissionTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 22,
    textAlign: 'center',
  },
  permissionText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  permissionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.sealOrange,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
  },
  permissionButtonText: {
    color: COLORS.warmWhite,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  backLink: {
    marginTop: SPACING.sm,
  },
  backLinkText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
});
