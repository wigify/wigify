import { ipcMain, screen, shell } from 'electron';
import { randomUUID } from 'node:crypto';

import type {
  WidgetBuildResult,
  WidgetInstance,
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
  updateWidgetSource,
  widgetExists,
  writeWidgetVariables,
} from '@/main/widget/fs';
import type { CreateWidgetOptions } from '@/main/widget/fs';
import { closeWidgetWindow, spawnWidgetWindow } from '@/main/widget/manager';

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
      return buildWidget(widgetName);
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

      const defaultPosition = (): { x: number; y: number } => {
        const { workArea } = screen.getPrimaryDisplay();
        return {
          x: workArea.x + workArea.width - manifest.size.width - 20,
          y: workArea.y + 20,
        };
      };

      const instance: WidgetInstance = {
        id: randomUUID(),
        widgetName,
        position: position ?? defaultPosition(),
        size: manifest.size,
        variables: mergedVariables,
        enabled: true,
      };

      await addWidgetInstance(instance);
      return instance;
    },
  );

  ipcMain.handle(
    'widget:remove-instance',
    async (_, instanceId: string): Promise<void> => {
      await removeWidgetInstance(instanceId);
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
      return window !== null;
    },
  );

  ipcMain.handle(
    'widget:close',
    async (_, instanceId: string): Promise<void> => {
      closeWidgetWindow(instanceId);
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
    },
  );

  ipcMain.handle(
    'widget:update-source',
    async (_, widgetName: string, code: string): Promise<void> => {
      await updateWidgetSource(widgetName, code);
    },
  );

  ipcMain.handle('widget:exists', async (_, name: string): Promise<boolean> => {
    return widgetExists(name);
  });
}
