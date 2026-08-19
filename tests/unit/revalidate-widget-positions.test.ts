import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getAllDisplaysMock,
  getDisplayNearestPointMock,
  updateWidgetInstanceMock,
} = vi.hoisted(() => ({
  getAllDisplaysMock: vi.fn(),
  getDisplayNearestPointMock: vi.fn(),
  updateWidgetInstanceMock: vi.fn(),
}));

vi.mock('electron', () => ({
  screen: {
    getAllDisplays: getAllDisplaysMock,
    getDisplayNearestPoint: getDisplayNearestPointMock,
  },
}));

vi.mock('@/main/widget/fs', () => ({
  getWidgetInstance: vi.fn(),
  readWidgetManifest: vi.fn(),
  readWidgetSource: vi.fn(),
  removeWidgetInstance: vi.fn(),
  updateWidgetInstance: updateWidgetInstanceMock,
}));

vi.mock('@/main/system/settings', () => ({
  loadSettings: vi.fn(),
}));

vi.mock('@/main/system/cursor-proximity', () => ({
  removeWidgetFromTracking: vi.fn(),
}));

vi.mock('@/main/utils/window', () => ({
  Window: vi.fn(),
  createWindow: vi.fn(),
}));

import {
  getAllWidgetWindows,
  revalidateWidgetPositions,
} from '@/main/widget/manager';

function createWindowMock(bounds: Electron.Rectangle) {
  return {
    isDestroyed: vi.fn(() => false),
    getBounds: vi.fn(() => bounds),
    setBounds: vi.fn(),
  };
}

describe('revalidateWidgetPositions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAllWidgetWindows().clear();
    getDisplayNearestPointMock.mockReturnValue({
      workArea: { x: 0, y: 0, width: 1920, height: 1080 },
    });
  });

  it('does not move widgets during brief single-display sleep recovery', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    getAllDisplaysMock.mockReturnValue([
      { workArea: { x: 0, y: 0, width: 1920, height: 1080 } },
      { workArea: { x: 1920, y: 0, width: 1920, height: 1080 } },
    ]);

    await revalidateWidgetPositions();

    const window = createWindowMock({
      x: 2500,
      y: 100,
      width: 300,
      height: 200,
    });
    getAllWidgetWindows().set('widget-1', window as never);

    vi.setSystemTime(1000);
    getAllDisplaysMock.mockReturnValue([
      { workArea: { x: 0, y: 0, width: 1920, height: 1080 } },
    ]);

    await revalidateWidgetPositions();

    expect(window.setBounds).not.toHaveBeenCalled();
    expect(updateWidgetInstanceMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('moves widgets back to visible area after grace window expires', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    getAllDisplaysMock.mockReturnValue([
      { workArea: { x: 0, y: 0, width: 1920, height: 1080 } },
      { workArea: { x: 1920, y: 0, width: 1920, height: 1080 } },
    ]);

    await revalidateWidgetPositions();

    const window = createWindowMock({
      x: 2500,
      y: 100,
      width: 300,
      height: 200,
    });
    getAllWidgetWindows().set('widget-1', window as never);

    vi.setSystemTime(10000);
    getAllDisplaysMock.mockReturnValue([
      { workArea: { x: 0, y: 0, width: 1920, height: 1080 } },
    ]);

    await revalidateWidgetPositions();

    expect(window.setBounds).toHaveBeenCalledTimes(1);
    expect(updateWidgetInstanceMock).toHaveBeenCalledWith('widget-1', {
      position: { x: 1600, y: 100 },
    });
    vi.useRealTimers();
  });
});
