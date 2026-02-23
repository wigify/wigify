import { app, BrowserWindow } from 'electron';

import { createTray } from './menu';
import { startCursorProximityTracking } from './system';
import { loadSettings } from './system/settings';
import { createWindow, Window } from './utils/window';
import {
  ensureConfigDirectories,
  getEnabledWidgetInstances,
  registerWidgetIpc,
  setAppQuitting,
  spawnWidgetWindow,
} from './widget';

export let mainWindow: Window | null = null;

async function initializeApp(): Promise<void> {
  await ensureConfigDirectories();
  registerWidgetIpc();
  await createTray();

  mainWindow = await createWindow({
    type: 'main',
    width: 800,
    height: 600,
    show: true,
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
