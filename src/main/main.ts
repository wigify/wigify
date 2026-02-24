import { app, BrowserWindow, nativeImage } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createTray } from '@/main/menu';
import { startCursorProximityTracking } from '@/main/system';
import { loadSettings } from '@/main/system/settings';
import { createWindow, Window } from '@/main/utils/window';
import {
  ensureConfigDirectories,
  getEnabledWidgetInstances,
  registerWidgetIpc,
  setAppQuitting,
  spawnWidgetWindow,
} from '@/main/widget';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export let mainWindow: Window | null = null;

function getAppIcon(): Electron.NativeImage | undefined {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icon.png')
    : path.join(__dirname, '../../build/icon.png');

  const icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) return undefined;
  return icon;
}

function setDockIcon(icon: Electron.NativeImage): void {
  if (process.platform === 'darwin') {
    app.dock.setIcon(icon);
  }
}

async function initializeApp(): Promise<void> {
  const icon = getAppIcon();
  if (icon) setDockIcon(icon);

  await ensureConfigDirectories();
  registerWidgetIpc();
  await createTray();

  mainWindow = await createWindow({
    type: 'main',
    width: 800,
    height: 600,
    show: true,
    electronOptions: icon ? { icon } : undefined,
  });

  const instances = await getEnabledWidgetInstances();
  for (const instance of instances) {
    await spawnWidgetWindow(instance);
  }

  const settings = await loadSettings();
  if (settings.autoHideWidgets) {
    startCursorProximityTracking();
  }
}

app.on('before-quit', () => {
  setAppQuitting();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    mainWindow = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeApp();
  }
});

app.whenReady().then(initializeApp);
