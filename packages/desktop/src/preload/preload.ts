import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';

type IpcCallback = (event: IpcRendererEvent, ...args: unknown[]) => void;

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (channel: string, callback: IpcCallback) => {
    ipcRenderer.on(channel, callback);
  },
  off: (channel: string, callback: IpcCallback) => {
    ipcRenderer.off(channel, callback);
  },
  send: (channel: string, ...args: unknown[]) => {
    ipcRenderer.send(channel, ...args);
  },
  invoke: <T>(channel: string, ...args: unknown[]): Promise<T> => {
    return ipcRenderer.invoke(channel, ...args);
  },
});
