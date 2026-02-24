import { autoUpdater } from 'electron-updater';
import { ipcMain } from 'electron';

import { isDev } from '@/main/utils/env';

function sendToMainWindow(channel: string, ...args: unknown[]): void {
  import('@/main/main').then(({ mainWindow }) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.getBrowserWindow().webContents.send(channel, ...args);
  });
}

export function initAutoUpdater(): void {
  if (isDev) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', info => {
    sendToMainWindow('updater:available', info.version);
  });

  autoUpdater.on('update-downloaded', info => {
    sendToMainWindow('updater:downloaded', info.version);
  });

  autoUpdater.on('error', error => {
    sendToMainWindow('updater:error', error.message);
  });

  autoUpdater.checkForUpdates();
}

export function registerUpdaterIpc(): void {
  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall(false, true);
  });
}
