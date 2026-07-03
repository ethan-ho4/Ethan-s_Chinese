import fs from 'node:fs';
import path from 'node:path';

import { CHINESE_ENTRIES } from '../src/data/chineseEntries';
import { CHINESE_PROVERBS } from '../src/data/chineseProverbs';

const outDir = path.join(process.cwd(), 'targets', 'widget', 'assets');

fs.mkdirSync(outDir, { recursive: true });

const entries = CHINESE_ENTRIES.map((entry) => ({
  id: entry.id,
  mandarin: entry.mandarin,
  traditional: entry.traditional ?? null,
  pinyin: entry.pinyin,
  english: entry.english,
  definition: entry.definition,
  kind: entry.kind,
  hskLevel: entry.hskLevel,
}));

const proverbs = CHINESE_PROVERBS.map((proverb) => ({
  id: proverb.id,
  mandarin: proverb.mandarin,
  traditional: proverb.traditional ?? null,
  pinyin: proverb.pinyin,
  english: proverb.english,
}));

fs.writeFileSync(path.join(outDir, 'entries.json'), JSON.stringify(entries, null, 2));
fs.writeFileSync(path.join(outDir, 'proverbs.json'), JSON.stringify(proverbs, null, 2));

console.log(`Exported ${entries.length} entries and ${proverbs.length} proverbs to ${outDir}`);
