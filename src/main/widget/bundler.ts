import { exec } from 'node:child_process';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import type { WidgetBuildResult } from '@/types';

import { getWidgetLocation } from './fs';

const execAsync = promisify(exec);

export async function buildWidget(
  widgetName: string,
): Promise<WidgetBuildResult> {
  const location = await getWidgetLocation(widgetName);
  if (!location) {
    return {
      status: 'error',
      error: `Widget not found: ${widgetName}`,
    };
  }

  const widgetPath = location.path;
  const srcPath = path.join(widgetPath, 'src', 'widget.tsx');
  const distPath = path.join(widgetPath, 'dist');
  const outputPath = path.join(distPath, 'widget.js');

  try {
    await fs.access(srcPath);
  } catch {
    return {
      status: 'error',
      error: `Widget source file not found: ${srcPath}`,
    };
  }

  try {
    await fs.mkdir(distPath, { recursive: true });

    const buildCommand = `bun build "${srcPath}" --outfile "${outputPath}" --format esm --target browser --external react --external react-dom --external @wigify/api`;

    const { stderr } = await execAsync(buildCommand, {
      cwd: widgetPath,
      timeout: 30000,
    });

    if (stderr && stderr.includes('error')) {
      return {
        status: 'error',
        error: stderr,
      };
    }

    return {
      status: 'success',
      outputPath,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown build error';
    return {
      status: 'error',
      error: errorMessage,
    };
  }
}

export async function watchWidget(
  widgetName: string,
  onBuild: (result: WidgetBuildResult) => void,
): Promise<() => void> {
  const location = await getWidgetLocation(widgetName);
  if (!location) {
    return () => {};
  }

  const srcPath = path.join(location.path, 'src');

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const watcher = fsSync.watch(srcPath, { recursive: true }, (_, filename) => {
    if (filename?.endsWith('.tsx') || filename?.endsWith('.ts')) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(async () => {
        const result = await buildWidget(widgetName);
        onBuild(result);
      }, 500);
    }
  });

  return () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    watcher.close();
  };
}
