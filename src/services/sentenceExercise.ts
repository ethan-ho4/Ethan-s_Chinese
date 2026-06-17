import { SENTENCE_EXERCISES } from '@/data/sentenceExercises';
import { ChineseScript, HskLevel, SentenceExercise } from '@/types';

export function getExercisesForHsk(level: HskLevel): SentenceExercise[] {
  return SENTENCE_EXERCISES.filter((exercise) => exercise.hskLevel === level);
}

export function shuffleTokens<T>(tokens: T[]): T[] {
  const shuffled = [...tokens];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getDisplayTokens(exercise: SentenceExercise, script: ChineseScript): string[] {
  if (script === 'traditional' && exercise.tokensTraditional) {
    return exercise.tokensTraditional;
  }
  return exercise.tokens;
}

export function isCorrectOrder(
  userOrder: string[],
  exercise: SentenceExercise,
  script: ChineseScript,
): boolean {
  const correct = getDisplayTokens(exercise, script);
  if (userOrder.length !== correct.length) return false;
  return userOrder.every((token, index) => token === correct[index]);
}

export type SentenceTileItem = {
  id: string;
  token: string;
  english: string;
  pinyin: string;
};

function buildTiles(exercise: SentenceExercise, script: ChineseScript): SentenceTileItem[] {
  const displayTokens = getDisplayTokens(exercise, script);
  return displayTokens.map((token, index) => ({
    id: `${exercise.id}-tile-${index}`,
    token,
    english: exercise.tokenEnglish[index],
    pinyin: exercise.tokenPinyin[index],
  }));
}

export function createExerciseTiles(
  exercise: SentenceExercise,
  script: ChineseScript,
): SentenceTileItem[] {
  const tiles = buildTiles(exercise, script);
  let shuffled = shuffleTokens(tiles);
  let attempts = 0;
  while (
    shuffled.every((tile, i) => tile.token === tiles[i].token) &&
    tiles.length > 1 &&
    attempts < 8
  ) {
    shuffled = shuffleTokens(tiles);
    attempts += 1;
  }
  return shuffled;
}

export function tilesToTokens(tiles: SentenceTileItem[]): string[] {
  return tiles.map((tile) => tile.token);
}
