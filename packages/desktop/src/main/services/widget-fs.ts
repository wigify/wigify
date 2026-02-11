import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

import type {
  WidgetConfig,
  WidgetInstance,
  WidgetManifest,
  WidgetState,
  WidgetVariableValues,
} from '@wigify/types';

import { decryptSecret, encryptSecret } from './secrets';

const CONFIG_DIR = path.join(app.getPath('home'), '.config', 'wigify');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const VARIABLES_DIR = path.join(CONFIG_DIR, 'variables');
const USER_WIDGETS_DIR = path.join(app.getPath('home'), '.wigify', 'widgets');

function getUserWidgetsDir(): string {
  return USER_WIDGETS_DIR;
}

export async function ensureConfigDirectories(): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.mkdir(VARIABLES_DIR, { recursive: true });
  await fs.mkdir(getUserWidgetsDir(), { recursive: true });
}

export type WidgetSource = 'user';

export interface WidgetLocation {
  name: string;
  source: WidgetSource;
  path: string;
}

async function listWidgetsFromDir(
  dir: string,
  source: WidgetSource,
): Promise<WidgetLocation[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        name: entry.name,
        source,
        path: path.join(dir, entry.name),
      }));
  } catch {
    return [];
  }
}

export async function listAllWidgetLocations(): Promise<WidgetLocation[]> {
  return listWidgetsFromDir(getUserWidgetsDir(), 'user');
}

export async function getWidgetLocation(
  widgetName: string,
): Promise<WidgetLocation | null> {
  const locations = await listAllWidgetLocations();
  return locations.find(l => l.name === widgetName) ?? null;
}

export async function getWidgetPath(widgetName: string): Promise<string> {
  const location = await getWidgetLocation(widgetName);
  if (!location) {
    throw new Error(`Widget not found: ${widgetName}`);
  }
  return location.path;
}

export async function readWidgetManifest(
  widgetName: string,
): Promise<WidgetManifest | null> {
  const location = await getWidgetLocation(widgetName);
  if (!location) return null;

  const manifestPath = path.join(location.path, 'package.json');

  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(content) as WidgetManifest;
  } catch {
    return null;
  }
}

function getVariablesFilePath(widgetName: string): string {
  return path.join(VARIABLES_DIR, `${widgetName}.json`);
}

export async function readWidgetVariables(
  widgetName: string,
  manifest: WidgetManifest,
): Promise<WidgetVariableValues> {
  const variablesPath = getVariablesFilePath(widgetName);

  try {
    const content = await fs.readFile(variablesPath, 'utf-8');
    const encryptedValues = JSON.parse(content) as Record<string, string>;
    const result: WidgetVariableValues = {};

    for (const varDef of manifest.variables ?? []) {
      const value = encryptedValues[varDef.name];
      if (value === undefined) {
        if (varDef.default !== undefined) {
          result[varDef.name] = varDef.default;
        }
        continue;
      }

      if (varDef.type === 'secret') {
        try {
          result[varDef.name] = decryptSecret(value);
        } catch {
          result[varDef.name] = '';
        }
      } else {
        result[varDef.name] = value;
      }
    }

    return result;
  } catch {
    const result: WidgetVariableValues = {};
    for (const varDef of manifest.variables ?? []) {
      if (varDef.default !== undefined) {
        result[varDef.name] = varDef.default;
      }
    }
    return result;
  }
}

export async function writeWidgetVariables(
  widgetName: string,
  manifest: WidgetManifest,
  variables: WidgetVariableValues,
): Promise<void> {
  await ensureConfigDirectories();
  const variablesPath = getVariablesFilePath(widgetName);
  const encryptedValues: Record<string, string> = {};

  for (const varDef of manifest.variables ?? []) {
    const value = variables[varDef.name];
    if (value === undefined) continue;

    if (varDef.type === 'secret' && typeof value === 'string') {
      encryptedValues[varDef.name] = encryptSecret(value);
    } else {
      encryptedValues[varDef.name] = String(value);
    }
  }

  await fs.writeFile(variablesPath, JSON.stringify(encryptedValues, null, 2));
}

export async function getWidgetBundlePath(widgetName: string): Promise<string> {
  const location = await getWidgetLocation(widgetName);
  if (!location) {
    throw new Error(`Widget not found: ${widgetName}`);
  }
  return path.join(location.path, 'dist', 'widget.js');
}

export async function isWidgetBuilt(widgetName: string): Promise<boolean> {
  try {
    const bundlePath = await getWidgetBundlePath(widgetName);
    await fs.access(bundlePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadWidgetState(
  widgetName: string,
): Promise<WidgetState | null> {
  const location = await getWidgetLocation(widgetName);
  if (!location) return null;

  const manifest = await readWidgetManifest(widgetName);
  if (!manifest) return null;

  const isBuilt = await isWidgetBuilt(widgetName);
  const config = await loadWidgetConfig();
  const instances = config.widgets.filter(w => w.widgetName === widgetName);

  return {
    manifest,
    path: location.path,
    isBuilt,
    instances,
  };
}

export async function listAllWidgets(): Promise<WidgetState[]> {
  const locations = await listAllWidgetLocations();
  const states: WidgetState[] = [];

  for (const loc of locations) {
    const state = await loadWidgetState(loc.name);
    if (state) {
      states.push(state);
    }
  }

  return states;
}

export async function loadWidgetConfig(): Promise<WidgetConfig> {
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(content) as WidgetConfig;
  } catch {
    return { widgets: [] };
  }
}

export async function saveWidgetConfig(config: WidgetConfig): Promise<void> {
  await ensureConfigDirectories();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function addWidgetInstance(
  instance: WidgetInstance,
): Promise<void> {
  const config = await loadWidgetConfig();
  config.widgets.push(instance);
  await saveWidgetConfig(config);
}

export async function removeWidgetInstance(instanceId: string): Promise<void> {
  const config = await loadWidgetConfig();
  config.widgets = config.widgets.filter(w => w.id !== instanceId);
  await saveWidgetConfig(config);
}

export async function updateWidgetInstance(
  instanceId: string,
  updates: Partial<WidgetInstance>,
): Promise<void> {
  const config = await loadWidgetConfig();
  const index = config.widgets.findIndex(w => w.id === instanceId);

  if (index !== -1) {
    config.widgets[index] = { ...config.widgets[index], ...updates };
    await saveWidgetConfig(config);
  }
}

export async function getWidgetInstance(
  instanceId: string,
): Promise<WidgetInstance | null> {
  const config = await loadWidgetConfig();
  return config.widgets.find(w => w.id === instanceId) ?? null;
}

export async function getEnabledWidgetInstances(): Promise<WidgetInstance[]> {
  const config = await loadWidgetConfig();
  return config.widgets.filter(w => w.enabled);
}
