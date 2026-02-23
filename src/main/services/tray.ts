import { app, Menu, nativeImage, Tray } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  isTrackingActive,
  startCursorProximityTracking,
  stopCursorProximityTracking,
} from './cursor-proximity';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_DEV = !!process.env['VITE_DEV_SERVER_URL'];
const APP_ROOT = path.join(__dirname, '..');

let tray: Tray | null = null;

function getTrayIconPath(): string {
  if (IS_DEV) {
    return path.join(APP_ROOT, 'src/main/menu/assets/iconTemplate.png');
  }

  return path.join(process.resourcesPath, 'menu-assets/iconTemplate.png');
}

function buildContextMenu(): Menu {
  return Menu.buildFromTemplate([
    {
      label: 'Auto-hide Widgets',
      type: 'checkbox',
      checked: isTrackingActive(),
      click: menuItem => {
        if (menuItem.checked) {
          startCursorProximityTracking();
          return;
        }

        stopCursorProximityTracking();
      },
    },
    { type: 'separator' },
    {
      label: 'Show Window',
      click: async () => {
        const { mainWindow } = await import('../main');
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

export function createTray(): void {
  const icon = nativeImage.createFromPath(getTrayIconPath());
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('Wigify');
  tray.setContextMenu(buildContextMenu());
}

export function refreshTrayMenu(): void {
  if (!tray) return;
  tray.setContextMenu(buildContextMenu());
}
