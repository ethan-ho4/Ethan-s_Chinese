import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';

import { ChineseScript, EntryTopic, ModeId } from '@/types';

const MODE_KEY = 'ethansChinese:selectedMode';
const TOPIC_KEY = 'ethansChinese:selectedFlashcardTopic';
const SCRIPT_KEY = 'ethansChinese:script';

export const DEFAULT_MODE: ModeId = 'all';
export const DEFAULT_TOPIC: EntryTopic = 'numbers';
export const DEFAULT_SCRIPT: ChineseScript = 'simplified';

function isModeId(value: string | null): value is ModeId {
  return (
    value === 'all' ||
    value === 'words' ||
    value === 'phrases' ||
    value === 'hsk1' ||
    value === 'hsk2' ||
    value === 'hsk3'
  );
}

function isEntryTopic(value: string | null): value is EntryTopic {
  return (
    value === 'numbers' ||
    value === 'time' ||
    value === 'people' ||
    value === 'food' ||
    value === 'transport' ||
    value === 'places' ||
    value === 'shopping' ||
    value === 'weather' ||
    value === 'body' ||
    value === 'home' ||
    value === 'nature' ||
    value === 'actions' ||
    value === 'descriptors' ||
    value === 'grammar'
  );
}

function isScript(value: string | null): value is ChineseScript {
  return value === 'simplified' || value === 'traditional';
}

type PreferencesContextValue = {
  isLoaded: boolean;
  selectedMode: ModeId;
  selectedTopic: EntryTopic;
  script: ChineseScript;
  setSelectedMode: (mode: ModeId) => Promise<void>;
  setSelectedTopic: (topic: EntryTopic) => Promise<void>;
  setScript: (script: ChineseScript) => Promise<void>;
  toggleScript: () => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [selectedMode, setSelectedModeState] = useState<ModeId>(DEFAULT_MODE);
  const [selectedTopic, setSelectedTopicState] = useState<EntryTopic>(DEFAULT_TOPIC);
  const [script, setScriptState] = useState<ChineseScript>(DEFAULT_SCRIPT);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPreferences() {
      const [storedMode, storedTopic, storedScript] = await Promise.all([
        AsyncStorage.getItem(MODE_KEY),
        AsyncStorage.getItem(TOPIC_KEY),
        AsyncStorage.getItem(SCRIPT_KEY),
      ]);

      if (!isMounted) return;

      if (isModeId(storedMode)) {
        setSelectedModeState(storedMode);
      }

      if (isEntryTopic(storedTopic)) {
        setSelectedTopicState(storedTopic);
      }

      if (isScript(storedScript)) {
        setScriptState(storedScript);
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

  const setScript = useCallback(async (next: ChineseScript) => {
    setScriptState(next);
    await AsyncStorage.setItem(SCRIPT_KEY, next);
  }, []);

  const toggleScript = useCallback(async () => {
    let next: ChineseScript = 'simplified';
    setScriptState((current) => {
      next = current === 'simplified' ? 'traditional' : 'simplified';
      return next;
    });
    await AsyncStorage.setItem(SCRIPT_KEY, next);
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        isLoaded,
        selectedMode,
        selectedTopic,
        script,
        setSelectedMode,
        setSelectedTopic,
        setScript,
        toggleScript,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
