export type EntryKind = 'word' | 'phrase';

export type HskLevel = 1 | 2 | 3;

export type EntryTopic =
  | 'numbers'
  | 'time'
  | 'people'
  | 'food'
  | 'transport'
  | 'places'
  | 'shopping'
  | 'weather'
  | 'body'
  | 'home'
  | 'nature'
  | 'actions'
  | 'descriptors'
  | 'grammar';

export type ModeId =
  | 'all'
  | 'words'
  | 'phrases'
  | 'hsk1'
  | 'hsk2'
  | 'hsk3';

export type ChineseScript = 'simplified' | 'traditional';

export type ChineseEntry = {
  id: string;
  mandarin: string;
  pinyin: string;
  english: string;
  definition: string;
  kind: EntryKind;
  hskLevel: HskLevel;
  topic: EntryTopic;
  example?: string;
  examplePinyin?: string;
  exampleEnglish?: string;
  traditional?: string;
  exampleTraditional?: string;
  isChindexEntry: true;
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
