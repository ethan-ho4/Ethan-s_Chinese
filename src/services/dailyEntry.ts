import { CHINESE_ENTRIES, CONTENT_MODES } from '@/data/chineseEntries';
import { ChineseEntry, ModeId } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const START_DATE_UTC = Date.UTC(2026, 0, 1);

export function getModeLabel(modeId: ModeId): string {
  return CONTENT_MODES.find((mode) => mode.id === modeId)?.label ?? 'All Words';
}

export function filterEntriesForMode(modeId: ModeId): ChineseEntry[] {
  switch (modeId) {
    case 'words':
      return CHINESE_ENTRIES.filter((entry) => entry.kind === 'word');
    case 'phrases':
      return CHINESE_ENTRIES.filter((entry) => entry.kind === 'phrase');
    case 'hsk1':
      return CHINESE_ENTRIES.filter((entry) => entry.hskLevel === 1);
    case 'hsk2':
      return CHINESE_ENTRIES.filter((entry) => entry.hskLevel === 2);
    case 'hsk3':
      return CHINESE_ENTRIES.filter((entry) => entry.hskLevel === 3);
    case 'all':
    default:
      return CHINESE_ENTRIES;
  }
}

export function getUtcDayNumber(date = new Date()): number {
  const utcMidnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

  return Math.floor((utcMidnight - START_DATE_UTC) / DAY_MS);
}

export function getDailyEntry(modeId: ModeId, date = new Date()): ChineseEntry {
  const entries = filterEntriesForMode(modeId);
  const usableEntries = entries.length > 0 ? entries : CHINESE_ENTRIES;
  const dayNumber = getUtcDayNumber(date);
  const index = ((dayNumber % usableEntries.length) + usableEntries.length) % usableEntries.length;

  return usableEntries[index];
}

export function getDailyDateLabel(date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
