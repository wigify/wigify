import { describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({
  screen: {
    getPrimaryDisplay: vi.fn(() => ({
      workArea: { x: 0, y: 0, width: 1440, height: 900 },
    })),
  },
}));

vi.mock('@/main/widget/fs', () => ({
  loadWidgetConfig: vi.fn(),
  updateWidgetInstance: vi.fn(),
}));

vi.mock('@/main/widget/manager', () => ({
  updateWidgetWindowPosition: vi.fn(),
}));

import type { WidgetInstance } from '@/types';

import { arrangeWidgets, findNextGridPosition } from '@/main/widget/grid';

function makeWidget(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
): WidgetInstance {
  return {
    id,
    widgetName: `widget-${id}`,
    position: { x, y },
    size: { width, height },
    variables: {},
    enabled: true,
  };
}

describe('grid', () => {
  describe('findNextGridPosition', () => {
    it('places first widget at top-right corner', () => {
      const pos = findNextGridPosition([], { width: 200, height: 100 });

      expect(pos).toEqual({ x: 1220, y: 20 });
    });

    it('places second widget below the first in the same column', () => {
      const existing = [makeWidget('1', 1220, 20, 200, 100)];
      const pos = findNextGridPosition(existing, { width: 200, height: 100 });

      expect(pos).toEqual({ x: 1220, y: 140 });
    });

    it('places multiple widgets vertically', () => {
      const existing = [
        makeWidget('1', 1220, 20, 200, 100),
        makeWidget('2', 1220, 140, 200, 100),
      ];
      const pos = findNextGridPosition(existing, { width: 200, height: 100 });

      expect(pos).toEqual({ x: 1220, y: 260 });
    });

    it('starts a new column to the left when vertical space runs out', () => {
      const widgets: WidgetInstance[] = [];
      let y = 20;
      let id = 1;
      while (y + 100 + 20 + 100 <= 880) {
        widgets.push(makeWidget(String(id), 1220, y, 200, 100));
        y += 120;
        id++;
      }
      widgets.push(makeWidget(String(id), 1220, y, 200, 100));

      const pos = findNextGridPosition(widgets, { width: 200, height: 100 });

      expect(pos.y).toBe(20);
      expect(pos.x).toBeLessThan(1220);
    });

    it('avoids overlapping with manually dragged widgets', () => {
      const existing = [makeWidget('1', 1100, 20, 200, 100)];
      const pos = findNextGridPosition(existing, { width: 200, height: 100 });

      const newRect = {
        x: pos.x,
        y: pos.y,
        width: 200,
        height: 100,
      };
      const existingRect = {
        x: 1100,
        y: 20,
        width: 200,
        height: 100,
      };

      const overlaps =
        newRect.x < existingRect.x + existingRect.width &&
        newRect.x + newRect.width > existingRect.x &&
        newRect.y < existingRect.y + existingRect.height &&
        newRect.y + newRect.height > existingRect.y;

      expect(overlaps).toBe(false);
    });

    it('fills gap in a column when a widget was removed', () => {
      const existing = [
        makeWidget('1', 1220, 20, 200, 100),
        makeWidget('3', 1220, 260, 200, 100),
      ];
      const pos = findNextGridPosition(existing, { width: 200, height: 100 });

      expect(pos).toEqual({ x: 1220, y: 140 });
    });
  });

  describe('arrangeWidgets', () => {
    it('returns empty map for no widgets', () => {
      const positions = arrangeWidgets([]);

      expect(positions.size).toBe(0);
    });

    it('places single widget at top-right', () => {
      const widgets = [makeWidget('1', 500, 500, 200, 100)];
      const positions = arrangeWidgets(widgets);

      expect(positions.get('1')).toEqual({ x: 1220, y: 20 });
    });

    it('arranges multiple widgets vertically in the first column', () => {
      const widgets = [
        makeWidget('1', 100, 100, 200, 100),
        makeWidget('2', 300, 300, 200, 100),
      ];
      const positions = arrangeWidgets(widgets);

      expect(positions.get('1')).toEqual({ x: 1220, y: 20 });
      expect(positions.get('2')).toEqual({ x: 1220, y: 140 });
    });

    it('wraps to a new column when vertical space is full', () => {
      const widgets: WidgetInstance[] = [];
      for (let i = 0; i < 10; i++) {
        widgets.push(makeWidget(String(i), 0, 0, 200, 100));
      }

      const positions = arrangeWidgets(widgets);
      const posArray = [...positions.values()];

      const firstColumnX = posArray[0].x;
      const hasSecondColumn = posArray.some(p => p.x < firstColumnX);

      expect(hasSecondColumn).toBe(true);
    });

    it('handles widgets with different sizes', () => {
      const widgets = [
        makeWidget('1', 0, 0, 300, 150),
        makeWidget('2', 0, 0, 200, 100),
      ];
      const positions = arrangeWidgets(widgets);

      const p1 = positions.get('1')!;
      const p2 = positions.get('2')!;

      expect(p1.y).toBe(20);
      expect(p2.y).toBe(190);
      expect(p1.x).toBe(1120);
      expect(p2.x).toBe(1220);
    });
  });
});
