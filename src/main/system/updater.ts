import { autoUpdater } from 'electron-updater';
import { ipcMain } from 'electron';

import { isDev } from '@/main/utils/env';

export type UpdateState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'up-to-date'
  | 'error';

interface UpdateStatus {
  state: UpdateState;
  version?: string;
  progress?: number;
  error?: string;
}

let currentStatus: UpdateStatus = { state: 'idle' };

function sendToMainWindow(channel: string, ...args: unknown[]): void {
  import('@/main/main').then(({ mainWindow }) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.getBrowserWindow().webContents.send(channel, ...args);
  });
}

type StatusChangeCallback = (status: UpdateStatus) => void;
let onStatusChange: StatusChangeCallback | null = null;

export function setOnStatusChange(callback: StatusChangeCallback | null): void {
  onStatusChange = callback;
}

function updateStatus(status: UpdateStatus): void {
  currentStatus = status;
  sendToMainWindow('updater:status', status);
  onStatusChange?.(status);
}

export function getUpdateStatus(): UpdateStatus {
  return currentStatus;
}

function simulateUpdateCheck(): void {
  updateStatus({ state: 'checking' });
  setTimeout(() => {
    updateStatus({ state: 'up-to-date' });
    setTimeout(() => updateStatus({ state: 'idle' }), 3000);
  }, 1500);
}

export function checkForUpdates(): void {
  if (isDev) {
    simulateUpdateCheck();
    return;
  }
  updateStatus({ state: 'checking' });
  autoUpdater.checkForUpdates();
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall(false, true);
}

export function initAutoUpdater(): void {
  if (isDev) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    updateStatus({ state: 'checking' });
  });

  autoUpdater.on('update-available', info => {
    updateStatus({ state: 'available', version: info.version });
  });

  autoUpdater.on('download-progress', progress => {
    updateStatus({
      state: 'downloading',
      version: currentStatus.version,
      progress: Math.round(progress.percent),
    });
  });

  autoUpdater.on('update-downloaded', info => {
    updateStatus({ state: 'ready', version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    updateStatus({ state: 'up-to-date' });
    setTimeout(() => updateStatus({ state: 'idle' }), 3000);
  });

  autoUpdater.on('error', error => {
    updateStatus({ state: 'error', error: error.message });
  });

  autoUpdater.checkForUpdates();
}

export function registerUpdaterIpc(): void {
  ipcMain.handle('updater:install', () => {
    installUpdate();
  });

  ipcMain.handle('updater:check', () => {
    checkForUpdates();
  });

  ipcMain.handle('updater:get-status', () => {
    return currentStatus;
  });
}
