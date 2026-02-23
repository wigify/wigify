import { BrowserWindow, app } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { WindowConfig, WindowData } from '@/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(__dirname, '../..');

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const RENDERER_DIST = path.join(APP_ROOT, 'dist');

const DEFAULT_CONFIG: Partial<WindowConfig> = {
  width: 800,
  height: 600,
  minWidth: 400,
  minHeight: 300,
  center: true,
  show: false,
  frame: true,
  resizable: true,
  movable: true,
  minimizable: true,
  maximizable: true,
  closable: true,
  focusable: true,
  hasShadow: true,
};

const MACOS_GLASSY_CONFIG: Partial<WindowConfig> = {
  titleBarStyle: 'hiddenInset',
};

export class Window {
  private browserWindow: BrowserWindow;
  private config: WindowConfig;

  constructor(config: WindowConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    const platformConfig = this.getPlatformConfig();
    const mergedConfig = { ...this.config, ...platformConfig };

    this.browserWindow = new BrowserWindow({
      width: mergedConfig.width,
      height: mergedConfig.height,
      minWidth: mergedConfig.minWidth,
      minHeight: mergedConfig.minHeight,
      maxWidth: mergedConfig.maxWidth,
      maxHeight: mergedConfig.maxHeight,
      x: mergedConfig.x,
      y: mergedConfig.y,
      center: mergedConfig.center,
      resizable: mergedConfig.resizable,
      movable: mergedConfig.movable,
      minimizable: mergedConfig.minimizable,
      maximizable: mergedConfig.maximizable,
      closable: mergedConfig.closable,
      focusable: mergedConfig.focusable,
      alwaysOnTop: mergedConfig.alwaysOnTop,
      fullscreen: mergedConfig.fullscreen,
      fullscreenable: mergedConfig.fullscreenable,
      skipTaskbar: mergedConfig.skipTaskbar,
      show: mergedConfig.show,
      frame: mergedConfig.frame,
      transparent: mergedConfig.transparent,
      vibrancy: mergedConfig.vibrancy,
      visualEffectState: mergedConfig.visualEffectState,
      titleBarStyle: mergedConfig.titleBarStyle,
      titleBarOverlay: mergedConfig.titleBarOverlay,
      trafficLightPosition: mergedConfig.trafficLightPosition,
      hasShadow: mergedConfig.hasShadow,
      backgroundColor: mergedConfig.backgroundColor,
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
        contextIsolation: true,
        nodeIntegration: false,
      },
      ...mergedConfig.electronOptions,
    });

    this.setupEventListeners();
  }

  private getPlatformConfig(): Partial<WindowConfig> {
    if (process.platform === 'darwin' && this.config.type !== 'widget') {
      return MACOS_GLASSY_CONFIG;
    }

    return {};
  }

  private setupEventListeners(): void {
    this.browserWindow.webContents.on('did-finish-load', () => {
      const windowData: WindowData = {
        type: this.config.type,
      };
      this.browserWindow.webContents.send('load', windowData);
    });

    this.browserWindow.once('ready-to-show', () => {
      if (this.config.show !== false) {
        this.browserWindow.show();
      }
    });
  }

  async load(): Promise<void> {
    const entry = this.config.type === 'widget' ? 'widget.html' : 'index.html';

    if (VITE_DEV_SERVER_URL) {
      const url = new URL(entry, VITE_DEV_SERVER_URL).href;
      await this.browserWindow.loadURL(url);
    } else {
      await this.browserWindow.loadFile(path.join(RENDERER_DIST, entry));
    }
  }

  show(): void {
    this.browserWindow.show();
  }

  hide(): void {
    this.browserWindow.hide();
  }

  close(): void {
    this.browserWindow.close();
  }

  focus(): void {
    this.browserWindow.focus();
  }

  blur(): void {
    this.browserWindow.blur();
  }

  isVisible(): boolean {
    return this.browserWindow.isVisible();
  }

  isDestroyed(): boolean {
    return this.browserWindow.isDestroyed();
  }

  getBrowserWindow(): BrowserWindow {
    return this.browserWindow;
  }

  getConfig(): WindowConfig {
    return this.config;
  }

  setTitle(title: string): void {
    this.browserWindow.setTitle(title);
  }

  setBounds(bounds: Electron.Rectangle): void {
    this.browserWindow.setBounds(bounds);
  }

  getBounds(): Electron.Rectangle {
    return this.browserWindow.getBounds();
  }

  center(): void {
    this.browserWindow.center();
  }

  setAlwaysOnTop(flag: boolean): void {
    this.browserWindow.setAlwaysOnTop(flag);
  }

  setResizable(resizable: boolean): void {
    this.browserWindow.setResizable(resizable);
  }

  setMovable(movable: boolean): void {
    this.browserWindow.setMovable(movable);
  }

  setMinimizable(minimizable: boolean): void {
    this.browserWindow.setMinimizable(minimizable);
  }

  setMaximizable(maximizable: boolean): void {
    this.browserWindow.setMaximizable(maximizable);
  }

  setClosable(closable: boolean): void {
    this.browserWindow.setClosable(closable);
  }

  minimize(): void {
    this.browserWindow.minimize();
  }

  maximize(): void {
    this.browserWindow.maximize();
  }

  unmaximize(): void {
    this.browserWindow.unmaximize();
  }

  isMaximized(): boolean {
    return this.browserWindow.isMaximized();
  }

  isMinimized(): boolean {
    return this.browserWindow.isMinimized();
  }

  restore(): void {
    this.browserWindow.restore();
  }

  on(event: string, listener: (...args: unknown[]) => void): this {
    this.browserWindow.on(event as 'close', listener);
    return this;
  }

  once(event: string, listener: (...args: unknown[]) => void): this {
    this.browserWindow.once(event as 'close', listener);
    return this;
  }

  off(event: string, listener: (...args: unknown[]) => void): this {
    this.browserWindow.off(event as 'close', listener);
    return this;
  }
}

export async function createWindow(config: WindowConfig): Promise<Window> {
  await app.whenReady();
  const window = new Window(config);
  await window.load();
  return window;
}
