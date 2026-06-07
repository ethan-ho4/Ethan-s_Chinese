import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { EntryTopic, ModeId } from '@/types';

const MODE_KEY = 'ethansChinese:selectedMode';
const TOPIC_KEY = 'ethansChinese:selectedFlashcardTopic';

export const DEFAULT_MODE: ModeId = 'all';
export const DEFAULT_TOPIC: EntryTopic = 'basics';

function isModeId(value: string | null): value is ModeId {
  return (
    value === 'all' ||
    value === 'words' ||
    value === 'phrases' ||
    value === 'beginner' ||
    value === 'conversation' ||
    value === 'food' ||
    value === 'travel'
  );
}

function isEntryTopic(value: string | null): value is EntryTopic {
  return (
    value === 'basics' ||
    value === 'conversation' ||
    value === 'food' ||
    value === 'travel' ||
    value === 'family' ||
    value === 'school' ||
    value === 'time' ||
    value === 'shopping'
  );
}

export function usePreferences() {
  const [selectedMode, setSelectedModeState] = useState<ModeId>(DEFAULT_MODE);
  const [selectedTopic, setSelectedTopicState] = useState<EntryTopic>(DEFAULT_TOPIC);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPreferences() {
      const [storedMode, storedTopic] = await Promise.all([
        AsyncStorage.getItem(MODE_KEY),
        AsyncStorage.getItem(TOPIC_KEY),
      ]);

      if (!isMounted) return;

      if (isModeId(storedMode)) {
        setSelectedModeState(storedMode);
      }

      if (isEntryTopic(storedTopic)) {
        setSelectedTopicState(storedTopic);
      }

      setIsLoaded(true);
    }

    loadPreferences().catch(() => {
      if (isMounted) setIsLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const setSelectedMode = useCallback(async (mode: ModeId) => {
    setSelectedModeState(mode);
    await AsyncStorage.setItem(MODE_KEY, mode);
  }, []);

  const setSelectedTopic = useCallback(async (topic: EntryTopic) => {
    setSelectedTopicState(topic);
    await AsyncStorage.setItem(TOPIC_KEY, topic);
  }, []);

  return {
    isLoaded,
    selectedMode,
    selectedTopic,
    setSelectedMode,
    setSelectedTopic,
  };
}
