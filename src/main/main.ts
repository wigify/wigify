import { app, BrowserWindow } from 'electron';

import { registerWidgetIpc } from './ipc/widget';
import { createWindow, Window } from './lib/window';
import { startCursorProximityTracking } from './services/cursor-proximity';
import { createTray } from './services/tray';
import {
  ensureConfigDirectories,
  getEnabledWidgetInstances,
} from './services/widget-fs';
import { setAppQuitting, spawnWidgetWindow } from './services/widget-manager';

export let mainWindow: Window | null = null;

async function initializeApp(): Promise<void> {
  await ensureConfigDirectories();
  registerWidgetIpc();
  createTray();

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

  startCursorProximityTracking();
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
