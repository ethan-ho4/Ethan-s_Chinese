import { CHINESE_PROVERBS } from '@/data/chineseProverbs';
import { ChineseProverb, ChineseScript } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function getCalendarDayOfYear(date = new Date()): number {
  const year = date.getUTCFullYear();
  const start = Date.UTC(year, 0, 0);
  const utc = Date.UTC(year, date.getUTCMonth(), date.getUTCDate());
  return Math.floor((utc - start) / DAY_MS);
}

export function getDailyProverb(date = new Date()): ChineseProverb {
  const dayOfYear = getCalendarDayOfYear(date);
  const index =
    ((dayOfYear % CHINESE_PROVERBS.length) + CHINESE_PROVERBS.length) % CHINESE_PROVERBS.length;
  return CHINESE_PROVERBS[index];
}

export function getProverbChinese(proverb: ChineseProverb, script: ChineseScript): string {
  return script === 'traditional' && proverb.traditional ? proverb.traditional : proverb.mandarin;
}
