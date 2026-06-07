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
  | 'shopping';

export type ModeId =
  | 'all'
  | 'words'
  | 'phrases'
  | 'beginner'
  | 'conversation'
  | 'food'
  | 'travel';

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
