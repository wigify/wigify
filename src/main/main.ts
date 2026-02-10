import { app, BrowserWindow } from 'electron';

import { createWindow, Window } from './lib/window';

export let mainWindow: Window | null = null;

async function initializeApp(): Promise<void> {
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
