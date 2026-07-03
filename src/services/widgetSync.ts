import { ExtensionStorage } from '@bacons/apple-targets';

import { ChineseScript, ModeId } from '@/types';

const APP_GROUP = 'group.com.ethanho.ethanschinese';
const MODE_KEY = 'selectedMode';
const SCRIPT_KEY = 'script';

const storage = new ExtensionStorage(APP_GROUP);

export function syncWidgetPreferences(mode: ModeId, script: ChineseScript): void {
  try {
    storage.set(MODE_KEY, mode);
    storage.set(SCRIPT_KEY, script);
    ExtensionStorage.reloadWidget('DailyMandarin');
    ExtensionStorage.reloadWidget('DailyProverb');
  } catch {
    // ExtensionStorage is unavailable in Expo Go and web.
  }
}
