export type EntryKind = 'word' | 'phrase';

export type EntryLevel = 'beginner' | 'intermediate';

export type EntryTopic =
  | 'basics'
  | 'conversation'
  | 'food'
  | 'travel'
  | 'family'
  | 'school'
  | 'time'
  | 'shopping'
  | 'animals';

export type ModeId =
  | 'all'
  | 'words'
  | 'phrases'
  | 'beginner'
  | 'conversation'
  | 'food'
  | 'travel';

export type ChindexCategory = 'food' | 'animals';

export type ChineseEntry = {
  id: string;
  mandarin: string;
  pinyin: string;
  english: string;
  definition: string;
  kind: EntryKind;
  level: EntryLevel;
  topic: EntryTopic;
  example?: string;
  examplePinyin?: string;
  exampleEnglish?: string;
  mlLabels?: string[];
  chindexCategory?: ChindexCategory;
  isChindexEntry?: boolean;
};

export type ContentMode = {
  id: ModeId;
  label: string;
  description: string;
};

export type TopicGroup = {
  id: EntryTopic;
  label: string;
  description: string;
};

export type CollectionState = {
  unlockedIds: string[];
  totalDiscovered: number;
  lastUnlocked?: {
    id: string;
    timestamp: number;
  };
};
