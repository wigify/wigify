import { app, Menu, nativeImage, Tray } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  startCursorProximityTracking,
  stopCursorProximityTracking,
} from '@/main/system/cursor-proximity';
import { loadSettings, updateSetting } from '@/main/system/settings';
import {
  checkForUpdates,
  getUpdateStatus,
  installUpdate,
  setOnStatusChange,
} from '@/main/system/updater';
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

async function openMainWindowAndUpdate(): Promise<void> {
  const { createMainWindow, mainWindow } = await import('@/main/main');
  await createMainWindow();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.getBrowserWindow().webContents.send('updater:start-install');
  }
  installUpdate();
}

function getUpdateMenuItem(): Electron.MenuItemConstructorOptions | null {
  const status = getUpdateStatus();

  switch (status.state) {
    case 'checking':
      return {
        label: 'Checking for Updates...',
        enabled: false,
      };
    case 'available':
    case 'downloading':
      return {
        label: status.progress
          ? `Downloading Update (${status.progress}%)...`
          : 'Downloading Update...',
        enabled: false,
      };
    case 'ready':
      return {
        label: `Update Available (v${status.version})`,
        click: openMainWindowAndUpdate,
      };
    case 'error':
      return {
        label: 'Check for Updates',
        sublabel: 'Last check failed',
        click: checkForUpdates,
      };
    default:
      return {
        label: 'Check for Updates',
        click: checkForUpdates,
      };
  }
}

async function buildContextMenu(): Promise<Menu> {
  const settings = await loadSettings();
  const updateMenuItem = getUpdateMenuItem();

  const menuItems: Electron.MenuItemConstructorOptions[] = [
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
        const { createMainWindow } = await import('@/main/main');
        await createMainWindow();
      },
    },
  ];

  if (updateMenuItem) {
    menuItems.push({ type: 'separator' });
    menuItems.push(updateMenuItem);
  }

  menuItems.push({ type: 'separator' });
  menuItems.push({
    label: 'Quit',
    click: () => app.quit(),
  });

  return Menu.buildFromTemplate(menuItems);
}

export async function createTray(): Promise<void> {
  const icon = nativeImage.createFromPath(getTrayIconPath());
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('Wigify');
  tray.setContextMenu(await buildContextMenu());

  setOnStatusChange(() => refreshTrayMenu());
}

export async function refreshTrayMenu(): Promise<void> {
  if (!tray) return;
  tray.setContextMenu(await buildContextMenu());
}
