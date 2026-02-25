import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

import type {
  WidgetConfig,
  WidgetInstance,
  WidgetManifest,
  WidgetSourceFiles,
  WidgetState,
  WidgetVariableValues,
} from '@/types';

import { decryptSecret, encryptSecret } from '@/main/system/secrets';

const CONFIG_DIR = path.join(app.getPath('home'), '.config', 'wigify');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const VARIABLES_DIR = path.join(CONFIG_DIR, 'variables');
const USER_WIDGETS_DIR = path.join(CONFIG_DIR, 'widgets');
const LEGACY_WIDGETS_DIR = path.join(app.getPath('home'), '.wigify', 'widgets');

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
  const [currentLocations, legacyLocations] = await Promise.all([
    listWidgetsFromDir(getUserWidgetsDir(), 'user'),
    listWidgetsFromDir(LEGACY_WIDGETS_DIR, 'user'),
  ]);

  const uniqueLocations = new Map<string, WidgetLocation>();

  for (const location of currentLocations) {
    uniqueLocations.set(location.name, location);
  }

  for (const location of legacyLocations) {
    if (!uniqueLocations.has(location.name)) {
      uniqueLocations.set(location.name, location);
    }
  }

  return [...uniqueLocations.values()];
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

export async function getWidgetSourcePath(widgetName: string): Promise<string> {
  const location = await getWidgetLocation(widgetName);
  if (!location) {
    throw new Error(`Widget not found: ${widgetName}`);
  }
  return path.join(location.path, 'widget.html');
}

async function readFileOrEmpty(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

export async function readWidgetSource(
  widgetName: string,
): Promise<WidgetSourceFiles> {
  const location = await getWidgetLocation(widgetName);
  if (!location) throw new Error(`Widget not found: ${widgetName}`);

  const htmlPath = path.join(location.path, 'widget.html');
  const cssPath = path.join(location.path, 'style.css');
  const jsPath = path.join(location.path, 'script.js');

  const [html, css, js] = await Promise.all([
    fs.readFile(htmlPath, 'utf-8'),
    readFileOrEmpty(cssPath),
    readFileOrEmpty(jsPath),
  ]);

  return { html, css, js };
}

export async function isWidgetBuilt(widgetName: string): Promise<boolean> {
  try {
    const sourcePath = await getWidgetSourcePath(widgetName);
    await fs.access(sourcePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadWidgetState(
  widgetName: string,
  preloaded?: { location?: WidgetLocation; config?: WidgetConfig },
): Promise<WidgetState | null> {
  const location = preloaded?.location ?? (await getWidgetLocation(widgetName));
  if (!location) return null;

  const manifestPath = path.join(location.path, 'package.json');
  const htmlPath = path.join(location.path, 'widget.html');
  const cssPath = path.join(location.path, 'style.css');
  const jsPath = path.join(location.path, 'script.js');

  const [manifestResult, html, css, js] = await Promise.all([
    fs
      .readFile(manifestPath, 'utf-8')
      .then(c => JSON.parse(c) as WidgetManifest)
      .catch(() => null),
    fs.readFile(htmlPath, 'utf-8').catch(() => null),
    readFileOrEmpty(cssPath),
    readFileOrEmpty(jsPath),
  ]);

  if (!manifestResult || html === null) return null;

  const config = preloaded?.config ?? (await loadWidgetConfig());
  const instances = config.widgets.filter(w => w.widgetName === widgetName);

  return {
    manifest: manifestResult,
    path: location.path,
    source: { html, css, js },
    isBuilt: true,
    instances,
  };
}

export async function listAllWidgets(): Promise<WidgetState[]> {
  const [locations, config] = await Promise.all([
    listAllWidgetLocations(),
    loadWidgetConfig(),
  ]);

  const results = await Promise.all(
    locations.map(loc => loadWidgetState(loc.name, { location: loc, config })),
  );

  return results.filter((s): s is WidgetState => s !== null);
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

export interface CreateWidgetOptions {
  name: string;
  source: WidgetSourceFiles;
  size: { width: number; height: number };
}

export async function createWidget(
  options: CreateWidgetOptions,
): Promise<void> {
  await ensureConfigDirectories();

  const widgetDir = path.join(getUserWidgetsDir(), options.name);

  try {
    await fs.access(widgetDir);
    throw new Error(`Widget "${options.name}" already exists`);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err;
    }
  }

  await fs.mkdir(widgetDir, { recursive: true });

  const manifest: WidgetManifest = {
    name: options.name,
    version: '1.0.0',
    title: options.name,
    size: options.size,
    resizable: true,
    variables: [],
  };

  await Promise.all([
    fs.writeFile(
      path.join(widgetDir, 'package.json'),
      JSON.stringify(manifest, null, 2),
    ),
    fs.writeFile(path.join(widgetDir, 'widget.html'), options.source.html),
    fs.writeFile(path.join(widgetDir, 'style.css'), options.source.css),
    fs.writeFile(path.join(widgetDir, 'script.js'), options.source.js),
  ]);
}

export async function deleteWidget(name: string): Promise<void> {
  const location = await getWidgetLocation(name);
  if (!location) {
    throw new Error(`Widget not found: ${name}`);
  }

  const config = await loadWidgetConfig();
  config.widgets = config.widgets.filter(w => w.widgetName !== name);
  await saveWidgetConfig(config);

  const variablesPath = getVariablesFilePath(name);
  await fs.rm(variablesPath, { force: true });

  await fs.rm(location.path, { recursive: true, force: true });
}

export async function updateWidgetSource(
  widgetName: string,
  source: WidgetSourceFiles,
): Promise<void> {
  const location = await getWidgetLocation(widgetName);
  if (!location) throw new Error(`Widget not found: ${widgetName}`);

  await Promise.all([
    fs.writeFile(path.join(location.path, 'widget.html'), source.html),
    fs.writeFile(path.join(location.path, 'style.css'), source.css),
    fs.writeFile(path.join(location.path, 'script.js'), source.js),
  ]);
}

export async function updateWidgetSize(
  widgetName: string,
  size: { width: number; height: number },
): Promise<void> {
  const location = await getWidgetLocation(widgetName);
  if (!location) throw new Error(`Widget not found: ${widgetName}`);

  const manifestPath = path.join(location.path, 'package.json');
  const content = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(content) as WidgetManifest;
  manifest.size = size;
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
}

export async function widgetExists(name: string): Promise<boolean> {
  const widgetDir = path.join(getUserWidgetsDir(), name);
  try {
    await fs.access(widgetDir);
    return true;
  } catch {
    return false;
  }
}
