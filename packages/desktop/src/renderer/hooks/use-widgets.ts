import { useCallback, useEffect, useState } from 'react';

import type {
  WidgetBuildResult,
  WidgetInstance,
  WidgetState,
  WidgetVariableValues,
} from '@wigify/types';

const ipc = () => window.ipcRenderer;

export function useWidgets() {
  const [widgets, setWidgets] = useState<WidgetState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWidgets = useCallback(async () => {
    if (!ipc()) {
      setLoading(false);
      setError('IPC not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await ipc().invoke<WidgetState[]>('widget:list');
      setWidgets(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load widgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const buildWidget = useCallback(
    async (widgetName: string): Promise<WidgetBuildResult> => {
      if (!ipc()) throw new Error('IPC not available');
      const result = await ipc().invoke<WidgetBuildResult>(
        'widget:build',
        widgetName,
      );
      await fetchWidgets();
      return result;
    },
    [fetchWidgets],
  );

  const addWidgetToScreen = useCallback(
    async (
      widgetName: string,
      variables?: WidgetVariableValues,
      position?: { x: number; y: number },
    ): Promise<WidgetInstance> => {
      if (!ipc()) throw new Error('IPC not available');
      const instance = await ipc().invoke<WidgetInstance>(
        'widget:add-instance',
        widgetName,
        position,
        variables,
      );
      await ipc().invoke('widget:spawn', instance.id);
      await fetchWidgets();
      return instance;
    },
    [fetchWidgets],
  );

  const removeWidgetFromScreen = useCallback(
    async (instanceId: string): Promise<void> => {
      if (!ipc()) return;
      await ipc().invoke('widget:close', instanceId);
      await ipc().invoke('widget:remove-instance', instanceId);
      await fetchWidgets();
    },
    [fetchWidgets],
  );

  const updateWidgetVariables = useCallback(
    async (
      widgetName: string,
      variables: WidgetVariableValues,
    ): Promise<void> => {
      if (!ipc()) return;
      await ipc().invoke('widget:set-variables', widgetName, variables);
      await fetchWidgets();
    },
    [fetchWidgets],
  );

  const openWidgetFolder = useCallback(
    async (widgetName: string): Promise<void> => {
      if (!ipc()) return;
      await ipc().invoke('widget:open-folder', widgetName);
    },
    [],
  );

  const spawnWidget = useCallback(async (instanceId: string): Promise<void> => {
    if (!ipc()) return;
    await ipc().invoke('widget:spawn', instanceId);
  }, []);

  const closeWidget = useCallback(async (instanceId: string): Promise<void> => {
    if (!ipc()) return;
    await ipc().invoke('widget:close', instanceId);
  }, []);

  return {
    widgets,
    loading,
    error,
    refresh: fetchWidgets,
    buildWidget,
    addWidgetToScreen,
    removeWidgetFromScreen,
    updateWidgetVariables,
    openWidgetFolder,
    spawnWidget,
    closeWidget,
  };
}
