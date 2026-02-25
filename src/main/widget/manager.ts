import { screen } from 'electron';

import type { WidgetInstance, WidgetWindowPayload, WindowData } from '@/types';

import { createWindow, Window } from '@/main/utils/window';
import { removeWidgetFromTracking } from '@/main/system/cursor-proximity';

import {
  getWidgetInstance,
  readWidgetManifest,
  readWidgetSource,
  removeWidgetInstance,
  updateWidgetInstance,
} from '@/main/widget/fs';

const HOVER_POLL_MS = 100;
const widgetWindows = new Map<string, Window>();
const widgetPayloads = new Map<string, WindowData>();
const hoverTimers = new Map<string, ReturnType<typeof setInterval>>();
const hoveredWidgets = new Set<string>();
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

  let source;

  try {
    source = await readWidgetSource(instance.widgetName);
  } catch {
    return null;
  }

  const payload: WidgetWindowPayload = {
    instanceId: instance.id,
    widgetName: instance.widgetName,
    source,
    variables: instance.variables,
    size: instance.size,
    refreshInterval: instance.refreshInterval,
  };

  const windowData: WindowData = {
    type: 'widget',
    payload,
  };

  const window = await createWindow({
    type: 'widget',
    width: instance.size.width,
    height: instance.size.height,
    minWidth: manifest.minSize?.width ?? 1,
    minHeight: manifest.minSize?.height ?? 1,
    ...(manifest.maxSize && {
      maxWidth: manifest.maxSize.width,
      maxHeight: manifest.maxSize.height,
    }),
    x: instance.position.x,
    y: instance.position.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    visibleOnAllWorkspaces: true,
    skipTaskbar: true,
    resizable: manifest.resizable ?? false,
    minimizable: false,
    maximizable: false,
    hasShadow: false,
    focusable: false,
    show: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: -100, y: -100 },
  });

  widgetPayloads.set(instance.id, windowData);
  window.getBrowserWindow().webContents.send('load', windowData);

  window.getBrowserWindow().webContents.on('did-finish-load', async () => {
    const storedData = widgetPayloads.get(instance.id);
    if (!storedData) return;

    const latest = await getWidgetInstance(instance.id);
    const storedPayload = storedData.payload as WidgetWindowPayload | undefined;
    if (latest && storedPayload) {
      storedPayload.refreshInterval = latest.refreshInterval;
    }

    window.getBrowserWindow().webContents.send('load', storedData);
  });

  window.on('closed', async () => {
    stopHoverTracking(instance.id);
    widgetWindows.delete(instance.id);
    widgetPayloads.delete(instance.id);
    removeWidgetFromTracking(instance.id);

    if (isAppQuitting) return;

    await removeWidgetInstance(instance.id);

    const { mainWindow } = await import('@/main/main');
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
    updateWidgetInstance(instance.id, {
      position: { x: bounds.x, y: bounds.y },
    });
  });

  window.on('resized', () => {
    const bounds = window.getBounds();
    updateWidgetInstance(instance.id, {
      size: { width: bounds.width, height: bounds.height },
    });
  });

  startHoverTracking(instance.id, window);
  widgetWindows.set(instance.id, window);
  return window;
}

function startHoverTracking(instanceId: string, win: Window): void {
  const timer = setInterval(() => {
    if (win.isDestroyed()) {
      stopHoverTracking(instanceId);
      return;
    }

    const cursor = screen.getCursorScreenPoint();
    const bounds = win.getBounds();
    const inside =
      cursor.x >= bounds.x &&
      cursor.x <= bounds.x + bounds.width &&
      cursor.y >= bounds.y &&
      cursor.y <= bounds.y + bounds.height;

    const wasHovered = hoveredWidgets.has(instanceId);
    if (inside === wasHovered) return;

    if (inside) {
      hoveredWidgets.add(instanceId);
    } else {
      hoveredWidgets.delete(instanceId);
    }

    win.getBrowserWindow().webContents.send('widget:hover', inside);
  }, HOVER_POLL_MS);

  hoverTimers.set(instanceId, timer);
}

function stopHoverTracking(instanceId: string): void {
  const timer = hoverTimers.get(instanceId);
  if (timer) {
    clearInterval(timer);
    hoverTimers.delete(instanceId);
  }
  hoveredWidgets.delete(instanceId);
}

export function closeWidgetWindow(instanceId: string): void {
  stopHoverTracking(instanceId);
  const window = widgetWindows.get(instanceId);
  if (window && !window.isDestroyed()) {
    window.close();
  }
  widgetWindows.delete(instanceId);
  widgetPayloads.delete(instanceId);
}

export function getWidgetWindow(instanceId: string): Window | undefined {
  return widgetWindows.get(instanceId);
}

export function getAllWidgetWindows(): Map<string, Window> {
  return widgetWindows;
}

export function closeAllWidgetWindows(): void {
  for (const [instanceId, window] of widgetWindows) {
    stopHoverTracking(instanceId);
    if (!window.isDestroyed()) {
      window.close();
    }
    widgetWindows.delete(instanceId);
    widgetPayloads.delete(instanceId);
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
