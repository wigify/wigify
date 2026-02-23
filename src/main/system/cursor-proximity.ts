import { screen } from 'electron';

import { getAllWidgetWindows } from '@/main/widget/manager';

const POLL_INTERVAL_MS = 50;
const PROXIMITY_THRESHOLD = 150;

let pollTimer: ReturnType<typeof setInterval> | null = null;
const hiddenWidgets = new Set<string>();

function distanceToRect(
  px: number,
  py: number,
  rect: Electron.Rectangle,
): number {
  const clampedX = Math.max(rect.x, Math.min(px, rect.x + rect.width));
  const clampedY = Math.max(rect.y, Math.min(py, rect.y + rect.height));
  return Math.sqrt((px - clampedX) ** 2 + (py - clampedY) ** 2);
}

function isPointInsideRect(
  px: number,
  py: number,
  rect: Electron.Rectangle,
): boolean {
  return (
    px >= rect.x &&
    px <= rect.x + rect.width &&
    py >= rect.y &&
    py <= rect.y + rect.height
  );
}

function isCursorCloseToAnyWidget(
  cursorPoint: Electron.Point,
  widgetWindows: Map<string, import('@/main/utils/window').Window>,
): boolean {
  for (const [, window] of widgetWindows) {
    if (window.isDestroyed()) continue;

    const bounds = window.getBrowserWindow().getBounds();
    const isInside = isPointInsideRect(cursorPoint.x, cursorPoint.y, bounds);

    if (isInside) return true;

    const distance = distanceToRect(cursorPoint.x, cursorPoint.y, bounds);
    if (distance < PROXIMITY_THRESHOLD) return true;
  }

  return false;
}

function pollCursorProximity(): void {
  const cursorPoint = screen.getCursorScreenPoint();
  const widgetWindows = getAllWidgetWindows();
  if (widgetWindows.size === 0) return;

  const shouldHide = isCursorCloseToAnyWidget(cursorPoint, widgetWindows);

  for (const [instanceId, window] of widgetWindows) {
    if (window.isDestroyed()) continue;

    const browserWindow = window.getBrowserWindow();
    const isHidden = hiddenWidgets.has(instanceId);

    if (shouldHide && !isHidden) {
      hideWidget(instanceId, browserWindow);
      continue;
    }

    if (!shouldHide && isHidden) {
      showWidget(instanceId, browserWindow);
    }
  }
}

function hideWidget(
  instanceId: string,
  browserWindow: Electron.BrowserWindow,
): void {
  hiddenWidgets.add(instanceId);
  browserWindow.setOpacity(0);
  browserWindow.setIgnoreMouseEvents(true, { forward: true });
}

function showWidget(
  instanceId: string,
  browserWindow: Electron.BrowserWindow,
): void {
  hiddenWidgets.delete(instanceId);
  browserWindow.setOpacity(1);
  browserWindow.setIgnoreMouseEvents(false);
}

function showAllWidgets(): void {
  const widgetWindows = getAllWidgetWindows();

  for (const [instanceId, window] of widgetWindows) {
    if (window.isDestroyed()) continue;
    if (!hiddenWidgets.has(instanceId)) continue;
    showWidget(instanceId, window.getBrowserWindow());
  }
}

export function startCursorProximityTracking(): void {
  if (pollTimer) return;
  pollTimer = setInterval(pollCursorProximity, POLL_INTERVAL_MS);
}

export function stopCursorProximityTracking(): void {
  if (!pollTimer) return;

  clearInterval(pollTimer);
  pollTimer = null;
  showAllWidgets();
}

export function isTrackingActive(): boolean {
  return pollTimer !== null;
}

export function removeWidgetFromTracking(instanceId: string): void {
  hiddenWidgets.delete(instanceId);
}
