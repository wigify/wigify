import type { BrowserWindowConstructorOptions } from 'electron';

export type WindowType = 'main' | 'widget';

export type TitleBarStyle =
  | 'default'
  | 'hidden'
  | 'hiddenInset'
  | 'customButtonsOnHover';

export interface WindowConfig {
  type: WindowType;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  x?: number;
  y?: number;
  center?: boolean;
  resizable?: boolean;
  movable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  focusable?: boolean;
  alwaysOnTop?: boolean;
  visibleOnAllWorkspaces?: boolean;
  fullscreen?: boolean;
  fullscreenable?: boolean;
  skipTaskbar?: boolean;
  show?: boolean;
  frame?: boolean;
  transparent?: boolean;
  titleBarStyle?: TitleBarStyle;
  titleBarOverlay?:
    | boolean
    | { color?: string; symbolColor?: string; height?: number };
  trafficLightPosition?: { x: number; y: number };
  hasShadow?: boolean;
  backgroundColor?: string;
  electronOptions?: Partial<BrowserWindowConstructorOptions>;
}

export interface WindowData {
  type: WindowType;
  payload?: unknown;
}
