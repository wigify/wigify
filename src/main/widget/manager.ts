import type { WidgetInstance, WidgetWindowPayload, WindowData } from '@/types';

import { createWindow, Window } from '../utils/window';
import { removeWidgetFromTracking } from '../system/cursor-proximity';

import {
  readWidgetManifest,
  readWidgetSource,
  removeWidgetInstance,
} from './fs';

const widgetWindows = new Map<string, Window>();
let isAppQuitting = false;

export function setAppQuitting(): void {
  isAppQuitting = true;
}

export async function spawnWidgetWindow(
  instance: WidgetInstance,
): Promise<Window | null> {
  if (widgetWindows.has(instance.id)) {
    const existingWindow = widgetWindows.get(instance.id);
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.focus();
      return existingWindow;
    }
  }

  const manifest = await readWidgetManifest(instance.widgetName);
  if (!manifest) {
    return null;
  }

  let sourceCode = '';

  try {
    sourceCode = await readWidgetSource(instance.widgetName);
  } catch {
    return null;
  }

  const payload: WidgetWindowPayload = {
    instanceId: instance.id,
    widgetName: instance.widgetName,
    sourceCode,
    variables: instance.variables,
    size: instance.size,
  };

  const windowData: WindowData = {
    type: 'widget',
    payload,
  };

  const window = await createWindow({
    type: 'widget',
    width: instance.size.width,
    height: instance.size.height,
    minWidth: 1,
    minHeight: 1,
    x: instance.position.x,
    y: instance.position.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: manifest.resizable ?? false,
    minimizable: false,
    maximizable: false,
    hasShadow: false,
    show: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: -100, y: -100 },
  });

  window.getBrowserWindow().webContents.send('load', windowData);

  window.on('closed', async () => {
    widgetWindows.delete(instance.id);
    removeWidgetFromTracking(instance.id);

    if (isAppQuitting) return;

    await removeWidgetInstance(instance.id);

    const { mainWindow } = await import('../main');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.getBrowserWindow().webContents.send('widget:removed');
    }
  });

  window.on('moved', () => {
    const bounds = window.getBounds();
    window
      .getBrowserWindow()
      .webContents.send('widget:position-changed', instance.id, {
        x: bounds.x,
        y: bounds.y,
      });
  });

  widgetWindows.set(instance.id, window);
  return window;
}

export function closeWidgetWindow(instanceId: string): void {
  const window = widgetWindows.get(instanceId);
  if (window && !window.isDestroyed()) {
    window.close();
  }
  widgetWindows.delete(instanceId);
}

export function getWidgetWindow(instanceId: string): Window | undefined {
  return widgetWindows.get(instanceId);
}

export function getAllWidgetWindows(): Map<string, Window> {
  return widgetWindows;
}

export function closeAllWidgetWindows(): void {
  for (const [instanceId, window] of widgetWindows) {
    if (!window.isDestroyed()) {
      window.close();
    }
    widgetWindows.delete(instanceId);
  }
}

export function updateWidgetWindowPosition(
  instanceId: string,
  x: number,
  y: number,
): void {
  const window = widgetWindows.get(instanceId);
  if (window && !window.isDestroyed()) {
    const bounds = window.getBounds();
    window.setBounds({ x, y, width: bounds.width, height: bounds.height });
  }
}

export function updateWidgetWindowSize(
  instanceId: string,
  width: number,
  height: number,
): void {
  const window = widgetWindows.get(instanceId);
  if (window && !window.isDestroyed()) {
    const bounds = window.getBounds();
    window.setBounds({ x: bounds.x, y: bounds.y, width, height });
  }
}
