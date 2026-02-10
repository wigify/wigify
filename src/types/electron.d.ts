import type { IpcRendererEvent } from 'electron';

type IpcCallback = (event: IpcRendererEvent, ...args: unknown[]) => void;

declare global {
  interface Window {
    ipcRenderer: {
      on: (channel: string, callback: IpcCallback) => void;
      off: (channel: string, callback: IpcCallback) => void;
      send: (channel: string, ...args: unknown[]) => void;
      invoke: <T>(channel: string, ...args: unknown[]) => Promise<T>;
    };
  }
}

export {};
