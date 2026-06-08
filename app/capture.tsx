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

import { CHINESE_ENTRIES } from '@/data/chineseEntries';
import { useCollection } from '@/store/collection';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/theme';
import { ChineseEntry, ChindexCategory } from '@/types';

type CaptureState = 'camera' | 'selecting' | 'success';

type SelectableItem = {
  id: string;
  label: string;
  entryIds: string[];
};

const FOOD_ITEMS: SelectableItem[] = [
  { id: 'banana', label: '🍌 Banana', entryIds: ['xiang-jiao'] },
  { id: 'apple', label: '🍎 Apple', entryIds: ['ping-guo'] },
  { id: 'orange', label: '🍊 Orange', entryIds: ['cheng-zi'] },
  { id: 'strawberry', label: '🍓 Strawberry', entryIds: ['cao-mei'] },
  { id: 'watermelon', label: '🍉 Watermelon', entryIds: ['xi-gua'] },
  { id: 'grapes', label: '🍇 Grapes', entryIds: ['pu-tao'] },
  { id: 'lemon', label: '🍋 Lemon', entryIds: ['ning-meng'] },
  { id: 'peach', label: '🍑 Peach', entryIds: ['tao-zi'] },
  { id: 'pear', label: '🍐 Pear', entryIds: ['li-zi'] },
  { id: 'pineapple', label: '🍍 Pineapple', entryIds: ['bo-luo'] },
  { id: 'mango', label: '🥭 Mango', entryIds: ['mang-guo'] },
  { id: 'broccoli', label: '🥦 Broccoli', entryIds: ['xi-lan-hua'] },
  { id: 'carrot', label: '🥕 Carrot', entryIds: ['hong-luo-bo'] },
  { id: 'corn', label: '🌽 Corn', entryIds: ['yu-mi'] },
  { id: 'tomato', label: '🍅 Tomato', entryIds: ['fan-qie'] },
  { id: 'potato', label: '🥔 Potato', entryIds: ['tu-dou'] },
  { id: 'mushroom', label: '🍄 Mushroom', entryIds: ['mo-gu'] },
  { id: 'onion', label: '🧅 Onion', entryIds: ['yang-cong'] },
  { id: 'garlic', label: '🧄 Garlic', entryIds: ['da-suan'] },
  { id: 'cucumber', label: '🥒 Cucumber', entryIds: ['huang-gua'] },
  { id: 'pepper', label: '🫑 Bell Pepper', entryIds: ['qing-jiao'] },
  { id: 'pizza', label: '🍕 Pizza', entryIds: ['pi-sa'] },
  { id: 'burger', label: '🍔 Hamburger', entryIds: ['han-bao-bao'] },
  { id: 'hotdog', label: '🌭 Hot Dog', entryIds: ['re-gou'] },
  { id: 'bread', label: '🍞 Bread', entryIds: ['mian-bao'] },
  { id: 'rice', label: '🍚 Rice', entryIds: ['mi-fan'] },
  { id: 'noodles', label: '🍜 Noodles', entryIds: ['mian-tiao'] },
  { id: 'egg', label: '🥚 Egg', entryIds: ['ji-dan'] },
  { id: 'cheese', label: '🧀 Cheese', entryIds: ['nai-lao'] },
  { id: 'icecream', label: '🍦 Ice Cream', entryIds: ['bing-qi-lin'] },
  { id: 'cake', label: '🍰 Cake', entryIds: ['dan-gao'] },
  { id: 'chocolate', label: '🍫 Chocolate', entryIds: ['qiao-ke-li'] },
  { id: 'coffee', label: '☕ Coffee', entryIds: ['ka-fei', 'ka-fei-bei'] },
  { id: 'tea', label: '🍵 Tea', entryIds: ['cha'] },
  { id: 'milk', label: '🥛 Milk', entryIds: ['nai'] },
  { id: 'juice', label: '🧃 Juice', entryIds: ['guo-zhi'] },
  { id: 'beer', label: '🍺 Beer', entryIds: ['pi-jiu'] },
  { id: 'wine', label: '🍷 Wine', entryIds: ['jiu'] },
];

const ANIMAL_ITEMS: SelectableItem[] = [
  { id: 'dog', label: '🐕 Dog', entryIds: ['gou'] },
  { id: 'cat', label: '🐈 Cat', entryIds: ['mao'] },
  { id: 'bird', label: '🐦 Bird', entryIds: ['niao'] },
  { id: 'fish', label: '🐟 Fish', entryIds: ['yu', 'jin-yu'] },
  { id: 'rabbit', label: '🐇 Rabbit', entryIds: ['tu-zi'] },
  { id: 'hamster', label: '🐹 Hamster', entryIds: ['cang-shu'] },
  { id: 'mouse', label: '🐭 Mouse', entryIds: ['lao-shu'] },
  { id: 'cow', label: '🐄 Cow', entryIds: ['niu'] },
  { id: 'pig', label: '🐷 Pig', entryIds: ['zhu'] },
  { id: 'sheep', label: '🐑 Sheep', entryIds: ['yang'] },
  { id: 'horse', label: '🐴 Horse', entryIds: ['ma'] },
  { id: 'chicken', label: '🐔 Chicken', entryIds: ['ji'] },
  { id: 'duck', label: '🦆 Duck', entryIds: ['ya-zi'] },
  { id: 'lion', label: '🦁 Lion', entryIds: ['shi-zi'] },
  { id: 'tiger', label: '🐯 Tiger', entryIds: ['lao-hu'] },
  { id: 'elephant', label: '🐘 Elephant', entryIds: ['da-xiang'] },
  { id: 'bear', label: '🐻 Bear', entryIds: ['xiong'] },
  { id: 'panda', label: '🐼 Panda', entryIds: ['xiong-mao'] },
  { id: 'monkey', label: '🐵 Monkey', entryIds: ['hou-zi'] },
  { id: 'gorilla', label: '🦍 Gorilla', entryIds: ['da-xing-xing'] },
  { id: 'zebra', label: '🦓 Zebra', entryIds: ['ban-ma'] },
  { id: 'giraffe', label: '🦒 Giraffe', entryIds: ['chang-jing-lu'] },
  { id: 'camel', label: '🐫 Camel', entryIds: ['luo-tuo'] },
  { id: 'fox', label: '🦊 Fox', entryIds: ['hu-li'] },
  { id: 'wolf', label: '🐺 Wolf', entryIds: ['lang'] },
  { id: 'deer', label: '🦌 Deer', entryIds: ['lu'] },
  { id: 'kangaroo', label: '🦘 Kangaroo', entryIds: ['dai-shu'] },
  { id: 'koala', label: '🐨 Koala', entryIds: ['shu-xi'] },
  { id: 'turtle', label: '🐢 Turtle', entryIds: ['wu-gui', 'hai-gui'] },
  { id: 'snake', label: '🐍 Snake', entryIds: ['she'] },
  { id: 'frog', label: '🐸 Frog', entryIds: ['qing-wa'] },
  { id: 'crocodile', label: '🐊 Crocodile', entryIds: ['e-yu'] },
  { id: 'shark', label: '🦈 Shark', entryIds: ['sha-yu'] },
  { id: 'whale', label: '🐋 Whale', entryIds: ['jing-yu'] },
  { id: 'dolphin', label: '🐬 Dolphin', entryIds: ['hai-tun'] },
  { id: 'octopus', label: '🐙 Octopus', entryIds: ['zhang-yu'] },
  { id: 'crab', label: '🦀 Crab', entryIds: ['pang-xie'] },
  { id: 'lobster', label: '🦞 Lobster', entryIds: ['long-xia'] },
  { id: 'butterfly', label: '🦋 Butterfly', entryIds: ['hu-die'] },
  { id: 'bee', label: '🐝 Bee', entryIds: ['mi-feng'] },
  { id: 'ant', label: '🐜 Ant', entryIds: ['ma-yi'] },
  { id: 'spider', label: '🕷️ Spider', entryIds: ['zhi-zhu'] },
  { id: 'snail', label: '🐌 Snail', entryIds: ['wo-niu'] },
  { id: 'owl', label: '🦉 Owl', entryIds: ['mao-tou-ying'] },
  { id: 'eagle', label: '🦅 Eagle', entryIds: ['lao-ying'] },
  { id: 'penguin', label: '🐧 Penguin', entryIds: ['qi-e'] },
  { id: 'flamingo', label: '🦩 Flamingo', entryIds: ['huo-lie-niao'] },
  { id: 'peacock', label: '🦚 Peacock', entryIds: ['kong-que'] },
  { id: 'parrot', label: '🦜 Parrot', entryIds: ['ying-wu'] },
];

export default function CaptureScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { unlockMultiple, isUnlocked } = useCollection();

  const [captureState, setCaptureState] = useState<CaptureState>('camera');
  const [selectedCategory, setSelectedCategory] = useState<ChindexCategory | null>(null);
  const [unlockedEntries, setUnlockedEntries] = useState<ChineseEntry[]>([]);
  const [photoTaken, setPhotoTaken] = useState(false);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
      });
      setPhotoTaken(true);
      setCaptureState('selecting');
    } catch (error) {
      console.error('Photo error:', error);
    }
  };

  const selectItem = async (item: SelectableItem) => {
    const newIds = item.entryIds.filter((id) => !isUnlocked(id));
    
    if (newIds.length > 0) {
      await unlockMultiple(newIds);
    }
    
    const entries = item.entryIds
      .map((id) => CHINESE_ENTRIES.find((e) => e.id === id))
      .filter((e): e is ChineseEntry => e !== undefined);
    
    setUnlockedEntries(entries);
    setCaptureState('success');
  };

  const resetCapture = () => {
    setCaptureState('camera');
    setSelectedCategory(null);
    setUnlockedEntries([]);
    setPhotoTaken(false);
  };

  const navigateToChindex = () => {
    router.push('/chindex');
  };

  const currentItems = selectedCategory === 'food' ? FOOD_ITEMS : 
                       selectedCategory === 'animals' ? ANIMAL_ITEMS : [];

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

        {!selectedCategory ? (
          <View style={styles.categorySelection}>
            <Text style={styles.selectPrompt}>Choose a category:</Text>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => setSelectedCategory('food')}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryEmoji}>🍎</Text>
              <Text style={styles.categoryLabel}>Food</Text>
              <Text style={styles.categoryCount}>{FOOD_ITEMS.length} items</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => setSelectedCategory('animals')}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryEmoji}>🐕</Text>
              <Text style={styles.categoryLabel}>Animals</Text>
              <Text style={styles.categoryCount}>{ANIMAL_ITEMS.length} items</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.itemSelection}>
            <TouchableOpacity
              style={styles.backToCategories}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={18} color={COLORS.textSecondary} />
              <Text style={styles.backToCategoriesText}>Back to categories</Text>
            </TouchableOpacity>
            <Text style={styles.selectPrompt}>
              Select what you photographed:
            </Text>
            <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
              <View style={styles.itemGrid}>
                {currentItems.map((item) => {
                  const alreadyUnlocked = item.entryIds.every((id) => isUnlocked(id));
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.itemButton,
                        alreadyUnlocked && styles.itemButtonUnlocked,
                      ]}
                      onPress={() => selectItem(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.itemLabel}>{item.label}</Text>
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

  if (captureState === 'success' && unlockedEntries.length > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.resultCard, styles.successCard, SHADOWS.glow]}>
          <View style={styles.resultIcon}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.lotusLeafGreen} />
          </View>
          <Text style={styles.resultTitle}>
            {unlockedEntries.length === 1 ? 'Word Discovered!' : `${unlockedEntries.length} Words Discovered!`}
          </Text>
          {unlockedEntries.map((entry) => (
            <View key={entry.id} style={styles.entryRow}>
              <Text style={styles.entryMandarin}>{entry.mandarin}</Text>
              <Text style={styles.entryPinyin}>{entry.pinyin}</Text>
              <Text style={styles.entryEnglish}>{entry.english}</Text>
            </View>
          ))}
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
            <Text style={styles.hint}>Take a photo, then select what it is</Text>
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
  categorySelection: {
    flex: 1,
    gap: SPACING.lg,
    padding: SPACING.lg,
  },
  selectPrompt: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    fontSize: 16,
    textAlign: 'center',
  },
  categoryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surfacePond,
    borderColor: COLORS.borderSoft,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  categoryEmoji: {
    fontSize: 48,
  },
  categoryLabel: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  categoryCount: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: 14,
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
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  itemButtonUnlocked: {
    backgroundColor: 'rgba(126,159,61,0.15)',
    borderColor: COLORS.lotusLeafGreen,
  },
  itemLabel: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.medium,
    fontSize: 15,
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
