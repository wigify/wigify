import { app, BrowserWindow } from 'electron';

import { registerWidgetIpc } from './ipc/widget';
import { createWindow, Window } from './lib/window';
import { ensureConfigDirectories } from './services/widget-fs';

export let mainWindow: Window | null = null;

async function initializeApp(): Promise<void> {
  await ensureConfigDirectories();
  registerWidgetIpc();

  mainWindow = await createWindow({
    type: 'main',
    width: 800,
    height: 600,
    show: true,
  });
}

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
