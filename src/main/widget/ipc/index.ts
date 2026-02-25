import { ipcMain, shell } from 'electron';
import { randomUUID } from 'node:crypto';

import type {
  WidgetBuildResult,
  WidgetInstance,
  WidgetSourceFiles,
  WidgetState,
  WidgetVariableValues,
} from '@/types';

import { buildWidget } from '@/main/widget/bundler';
import {
  addWidgetInstance,
  createWidget,
  deleteWidget,
  getEnabledWidgetInstances,
  getWidgetBundlePath,
  getWidgetInstance,
  getWidgetPath,
  listAllWidgets,
  loadWidgetConfig,
  loadWidgetState,
  readWidgetManifest,
  readWidgetVariables,
  removeWidgetInstance,
  updateWidgetInstance,
  updateWidgetSize,
  updateWidgetSource,
  widgetExists,
  writeWidgetVariables,
} from '@/main/widget/fs';
import type { CreateWidgetOptions } from '@/main/widget/fs';
import { arrangeAllWidgets, findNextGridPosition } from '@/main/widget/grid';
import { closeWidgetWindow, spawnWidgetWindow } from '@/main/widget/manager';

async function notifyWidgetChanged(): Promise<void> {
  const { mainWindow } = await import('@/main/main');
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.getBrowserWindow().webContents.send('widget:changed');
  }
}

export function registerWidgetIpc(): void {
  ipcMain.handle('widget:list', async (): Promise<WidgetState[]> => {
    return listAllWidgets();
  });

  ipcMain.handle(
    'widget:get',
    async (_, widgetName: string): Promise<WidgetState | null> => {
      return loadWidgetState(widgetName);
    },
  );

  ipcMain.handle(
    'widget:build',
    async (_, widgetName: string): Promise<WidgetBuildResult> => {
      const result = await buildWidget(widgetName);
      await notifyWidgetChanged();
      return result;
    },
  );

  ipcMain.handle(
    'widget:get-bundle-path',
    async (_, widgetName: string): Promise<string> => {
      return getWidgetBundlePath(widgetName);
    },
  );

  ipcMain.handle(
    'widget:get-variables',
    async (_, widgetName: string): Promise<WidgetVariableValues> => {
      const manifest = await readWidgetManifest(widgetName);
      if (!manifest) return {};
      return readWidgetVariables(widgetName, manifest);
    },
  );

  ipcMain.handle(
    'widget:set-variables',
    async (
      _,
      widgetName: string,
      variables: WidgetVariableValues,
    ): Promise<void> => {
      const manifest = await readWidgetManifest(widgetName);
      if (!manifest) {
        throw new Error(`Widget manifest not found: ${widgetName}`);
      }
      await writeWidgetVariables(widgetName, manifest, variables);
      await notifyWidgetChanged();
    },
  );

  ipcMain.handle(
    'widget:add-instance',
    async (
      _,
      widgetName: string,
      position?: { x: number; y: number },
      variables?: WidgetVariableValues,
    ): Promise<WidgetInstance> => {
      const manifest = await readWidgetManifest(widgetName);
      if (!manifest) {
        throw new Error(`Widget manifest not found: ${widgetName}`);
      }

      const defaultVariables = await readWidgetVariables(widgetName, manifest);
      const mergedVariables = { ...defaultVariables, ...variables };

      const config = await loadWidgetConfig();
      const gridPosition =
        position ?? findNextGridPosition(config.widgets, manifest.size);

      const instance: WidgetInstance = {
        id: randomUUID(),
        widgetName,
        position: gridPosition,
        size: manifest.size,
        variables: mergedVariables,
        enabled: true,
      };

      await addWidgetInstance(instance);
      await notifyWidgetChanged();
      return instance;
    },
  );

  ipcMain.handle(
    'widget:remove-instance',
    async (_, instanceId: string): Promise<void> => {
      await removeWidgetInstance(instanceId);
      await notifyWidgetChanged();
    },
  );

  ipcMain.handle(
    'widget:update-instance',
    async (
      _,
      instanceId: string,
      updates: Partial<WidgetInstance>,
    ): Promise<void> => {
      await updateWidgetInstance(instanceId, updates);
    },
  );

  ipcMain.handle(
    'widget:get-instance',
    async (_, instanceId: string): Promise<WidgetInstance | null> => {
      return getWidgetInstance(instanceId);
    },
  );

  ipcMain.handle(
    'widget:open-folder',
    async (_, widgetName: string): Promise<void> => {
      const widgetPath = await getWidgetPath(widgetName);
      await shell.openPath(widgetPath);
    },
  );

  ipcMain.handle(
    'widget:spawn',
    async (_, instanceId: string): Promise<boolean> => {
      const instance = await getWidgetInstance(instanceId);
      if (!instance) return false;

      const window = await spawnWidgetWindow(instance);
      await notifyWidgetChanged();
      return window !== null;
    },
  );

  ipcMain.handle(
    'widget:close',
    async (_, instanceId: string): Promise<void> => {
      closeWidgetWindow(instanceId);
      await notifyWidgetChanged();
    },
  );

  ipcMain.handle('widget:spawn-all', async (): Promise<void> => {
    const instances = await getEnabledWidgetInstances();
    for (const instance of instances) {
      await spawnWidgetWindow(instance);
    }
  });

  ipcMain.handle(
    'widget:create',
    async (_, options: CreateWidgetOptions): Promise<void> => {
      await createWidget(options);
      await notifyWidgetChanged();
    },
  );

  ipcMain.handle(
    'widget:delete',
    async (_, widgetName: string): Promise<void> => {
      const config = await loadWidgetConfig();
      const instances = config.widgets.filter(w => w.widgetName === widgetName);
      for (const instance of instances) {
        closeWidgetWindow(instance.id);
      }
      await deleteWidget(widgetName);
      await notifyWidgetChanged();
    },
  );

  ipcMain.handle(
    'widget:update-source',
    async (_, widgetName: string, source: WidgetSourceFiles): Promise<void> => {
      await updateWidgetSource(widgetName, source);
      await notifyWidgetChanged();
    },
  );

  ipcMain.handle(
    'widget:update-size',
    async (
      _,
      widgetName: string,
      size: { width: number; height: number },
    ): Promise<void> => {
      await updateWidgetSize(widgetName, size);
      await notifyWidgetChanged();
    },
  );

  ipcMain.handle('widget:exists', async (_, name: string): Promise<boolean> => {
    return widgetExists(name);
  });

  ipcMain.handle('widget:arrange', async (): Promise<void> => {
    await arrangeAllWidgets();
    await notifyWidgetChanged();
  });
}
