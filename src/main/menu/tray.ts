import { app, Menu, nativeImage, Tray } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  startCursorProximityTracking,
  stopCursorProximityTracking,
} from '@/main/system/cursor-proximity';
import { loadSettings, updateSetting } from '@/main/system/settings';
import { isDev } from '@/main/utils/env';
import { arrangeAllWidgets } from '@/main/widget/grid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '..');

let tray: Tray | null = null;

function getTrayIconPath(): string {
  if (isDev) {
    return path.join(APP_ROOT, 'src/main/menu/icons/iconTemplate.png');
  }

  return path.join(process.resourcesPath, 'menu-icons/iconTemplate.png');
}

async function buildContextMenu(): Promise<Menu> {
  const settings = await loadSettings();

  return Menu.buildFromTemplate([
    {
      label: 'Auto-hide Widgets',
      type: 'checkbox',
      checked: settings.autoHideWidgets,
      click: async menuItem => {
        await updateSetting('autoHideWidgets', menuItem.checked);

        if (menuItem.checked) {
          startCursorProximityTracking();
          return;
        }

        stopCursorProximityTracking();
      },
    },
    {
      label: 'Arrange Widgets',
      click: () => arrangeAllWidgets(),
    },
    { type: 'separator' },
    {
      label: 'Show Window',
      click: async () => {
        const { mainWindow } = await import('@/main/main');
        if (!mainWindow || mainWindow.isDestroyed()) return;
        mainWindow.show();
        mainWindow.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);
}

export async function createTray(): Promise<void> {
  const icon = nativeImage.createFromPath(getTrayIconPath());
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('Wigify');
  tray.setContextMenu(await buildContextMenu());
}

export async function refreshTrayMenu(): Promise<void> {
  if (!tray) return;
  tray.setContextMenu(await buildContextMenu());
}
