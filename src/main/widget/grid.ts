import { screen } from 'electron';

import type { WidgetInstance, WidgetPosition, WidgetSize } from '@/types';

import { loadWidgetConfig, updateWidgetInstance } from '@/main/widget/fs';
import { updateWidgetWindowPosition } from '@/main/widget/manager';

const GRID_GAP = 20;
const GRID_MARGIN = 20;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getWorkArea(): Rect {
  const { workArea } = screen.getPrimaryDisplay();
  return workArea;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function isPositionFree(
  candidate: Rect,
  occupied: Rect[],
  workArea: Rect,
): boolean {
  if (candidate.x < workArea.x + GRID_MARGIN) return false;
  if (candidate.x + candidate.width > workArea.x + workArea.width - GRID_MARGIN)
    return false;
  if (
    candidate.y + candidate.height >
    workArea.y + workArea.height - GRID_MARGIN
  )
    return false;

  return !occupied.some(rect => rectsOverlap(candidate, rect));
}

export function findNextGridPosition(
  existingWidgets: WidgetInstance[],
  newSize: WidgetSize,
): WidgetPosition {
  const workArea = getWorkArea();
  const rightEdge = workArea.x + workArea.width - GRID_MARGIN;
  const topY = workArea.y + GRID_MARGIN;

  if (existingWidgets.length === 0) {
    return { x: rightEdge - newSize.width, y: topY };
  }

  const occupied: Rect[] = existingWidgets.map(w => ({
    x: w.position.x,
    y: w.position.y,
    width: w.size.width,
    height: w.size.height,
  }));

  let columnRight = rightEdge;

  while (columnRight - newSize.width >= workArea.x + GRID_MARGIN) {
    let y = topY;

    while (y + newSize.height <= workArea.y + workArea.height - GRID_MARGIN) {
      const candidate: Rect = {
        x: columnRight - newSize.width,
        y,
        width: newSize.width,
        height: newSize.height,
      };

      if (isPositionFree(candidate, occupied, workArea)) {
        return { x: candidate.x, y: candidate.y };
      }

      const blocker = occupied.find(r => rectsOverlap(candidate, r));

      if (!blocker) {
        y += newSize.height + GRID_GAP;
        continue;
      }

      y = blocker.y + blocker.height + GRID_GAP;
    }

    const columnWidgets = occupied.filter(
      r => r.x < columnRight && r.x + r.width > columnRight - newSize.width,
    );
    const columnLeft =
      columnWidgets.length > 0
        ? Math.min(...columnWidgets.map(r => r.x))
        : columnRight - newSize.width;

    columnRight = columnLeft - GRID_GAP;
  }

  return { x: rightEdge - newSize.width, y: topY };
}

export function arrangeWidgets(
  widgets: WidgetInstance[],
): Map<string, WidgetPosition> {
  const workArea = getWorkArea();
  const rightEdge = workArea.x + workArea.width - GRID_MARGIN;
  const topY = workArea.y + GRID_MARGIN;
  const maxBottom = workArea.y + workArea.height - GRID_MARGIN;

  const positions = new Map<string, WidgetPosition>();

  let columnRight = rightEdge;
  let currentY = topY;
  let columnMaxWidth = 0;

  for (const widget of widgets) {
    if (currentY + widget.size.height > maxBottom) {
      columnRight = columnRight - columnMaxWidth - GRID_GAP;
      currentY = topY;
      columnMaxWidth = 0;
    }

    if (columnRight - widget.size.width < workArea.x + GRID_MARGIN) {
      columnRight = rightEdge;
      currentY = topY;
      columnMaxWidth = 0;
    }

    positions.set(widget.id, {
      x: columnRight - widget.size.width,
      y: currentY,
    });

    columnMaxWidth = Math.max(columnMaxWidth, widget.size.width);
    currentY += widget.size.height + GRID_GAP;
  }

  return positions;
}

export async function arrangeAllWidgets(): Promise<void> {
  const config = await loadWidgetConfig();
  const enabledWidgets = config.widgets.filter(w => w.enabled);
  const positions = arrangeWidgets(enabledWidgets);

  for (const [instanceId, position] of positions) {
    await updateWidgetInstance(instanceId, { position });
    updateWidgetWindowPosition(instanceId, position.x, position.y);
  }
}
