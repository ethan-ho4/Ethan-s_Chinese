import { ChineseEntry, ChineseScript } from '@/types';

export function getChinese(entry: ChineseEntry, script: ChineseScript): string {
  return script === 'traditional' && entry.traditional ? entry.traditional : entry.mandarin;
}

export function getChineseExample(
  entry: ChineseEntry,
  script: ChineseScript
): string | undefined {
  if (script === 'traditional' && entry.exampleTraditional) {
    return entry.exampleTraditional;
  }
  return entry.example;
}
