import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

import type { AppSettings } from '@/types';

const CONFIG_DIR = path.join(app.getPath('home'), '.config', 'wigify');
const SETTINGS_FILE = path.join(CONFIG_DIR, 'settings.json');

const DEFAULT_SETTINGS: AppSettings = {
  autoHideWidgets: true,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const content = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const saved = JSON.parse(content) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
): Promise<void> {
  const settings = await loadSettings();
  settings[key] = value;
  await saveSettings(settings);
}
