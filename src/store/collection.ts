import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { CHINESE_ENTRIES } from '@/data/chineseEntries';
import { CollectionState } from '@/types';

const COLLECTION_KEY = 'ethansChinese:collection';

const DEFAULT_COLLECTION: CollectionState = {
  unlockedIds: [],
  totalDiscovered: 0,
  lastUnlocked: undefined,
};

export function useCollection() {
  const [collection, setCollectionState] = useState<CollectionState>(DEFAULT_COLLECTION);
  const [isLoaded, setIsLoaded] = useState(false);

  const chindexEntries = CHINESE_ENTRIES.filter((entry) => entry.isChindexEntry);
  const totalChindexEntries = chindexEntries.length;

  useEffect(() => {
    let isMounted = true;

    async function loadCollection() {
      const stored = await AsyncStorage.getItem(COLLECTION_KEY);

      if (!isMounted) return;

      if (stored) {
        try {
          const parsed = JSON.parse(stored) as CollectionState;
          setCollectionState(parsed);
        } catch {
          setCollectionState(DEFAULT_COLLECTION);
        }
      }

      setIsLoaded(true);
    }

    loadCollection().catch(() => {
      if (isMounted) setIsLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const isUnlocked = useCallback(
    (entryId: string) => {
      return collection.unlockedIds.includes(entryId);
    },
    [collection.unlockedIds]
  );

  const unlockEntry = useCallback(
    async (entryId: string) => {
      if (collection.unlockedIds.includes(entryId)) {
        return false;
      }

      const newCollection: CollectionState = {
        unlockedIds: [...collection.unlockedIds, entryId],
        totalDiscovered: collection.totalDiscovered + 1,
        lastUnlocked: {
          id: entryId,
          timestamp: Date.now(),
        },
      };

      setCollectionState(newCollection);
      await AsyncStorage.setItem(COLLECTION_KEY, JSON.stringify(newCollection));
      return true;
    },
    [collection]
  );

  const unlockMultiple = useCallback(
    async (entryIds: string[]) => {
      const newIds = entryIds.filter((id) => !collection.unlockedIds.includes(id));

      if (newIds.length === 0) {
        return [];
      }

      const lastId = newIds[newIds.length - 1];
      const newCollection: CollectionState = {
        unlockedIds: [...collection.unlockedIds, ...newIds],
        totalDiscovered: collection.totalDiscovered + newIds.length,
        lastUnlocked: {
          id: lastId,
          timestamp: Date.now(),
        },
      };

      setCollectionState(newCollection);
      await AsyncStorage.setItem(COLLECTION_KEY, JSON.stringify(newCollection));
      return newIds;
    },
    [collection]
  );

  const lockEntry = useCallback(
    async (entryId: string) => {
      if (!collection.unlockedIds.includes(entryId)) {
        return false;
      }

      const newCollection: CollectionState = {
        unlockedIds: collection.unlockedIds.filter((id) => id !== entryId),
        totalDiscovered: Math.max(0, collection.totalDiscovered - 1),
        lastUnlocked: collection.lastUnlocked,
      };

      setCollectionState(newCollection);
      await AsyncStorage.setItem(COLLECTION_KEY, JSON.stringify(newCollection));
      return true;
    },
    [collection]
  );

  const resetCollection = useCallback(async () => {
    setCollectionState(DEFAULT_COLLECTION);
    await AsyncStorage.removeItem(COLLECTION_KEY);
  }, []);

  const getProgressPercentage = useCallback(() => {
    if (totalChindexEntries === 0) return 0;
    return Math.round((collection.unlockedIds.length / totalChindexEntries) * 100);
  }, [collection.unlockedIds.length, totalChindexEntries]);

  return {
    isLoaded,
    collection,
    unlockedCount: collection.unlockedIds.length,
    totalChindexEntries,
    progressPercentage: getProgressPercentage(),
    isUnlocked,
    unlockEntry,
    unlockMultiple,
    lockEntry,
    resetCollection,
    lastUnlocked: collection.lastUnlocked,
  };
}

export function findEntriesByMlLabel(label: string): string[] {
  const normalizedLabel = label.toLowerCase().trim();

  return CHINESE_ENTRIES.filter((entry) => {
    if (!entry.mlLabels || !entry.isChindexEntry) return false;

    return entry.mlLabels.some(
      (mlLabel) => mlLabel.toLowerCase() === normalizedLabel
    );
  }).map((entry) => entry.id);
}

export function findAllMatchingEntries(labels: string[]): string[] {
  const matchedIds = new Set<string>();

  for (const label of labels) {
    const entries = findEntriesByMlLabel(label);
    entries.forEach((id) => matchedIds.add(id));
  }

  return Array.from(matchedIds);
}
