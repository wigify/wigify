import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  WidgetBuildResult,
  WidgetInstance,
  WidgetState,
  WidgetVariableValues,
} from '@/types';

const ipc = () => window.ipcRenderer;

interface WidgetStore {
  widgets: WidgetState[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  buildWidget: (widgetName: string) => Promise<WidgetBuildResult>;
  addWidgetToScreen: (
    widgetName: string,
    variables?: WidgetVariableValues,
    position?: { x: number; y: number },
  ) => Promise<WidgetInstance>;
  removeWidgetFromScreen: (instanceId: string) => Promise<void>;
  updateWidgetVariables: (
    widgetName: string,
    variables: WidgetVariableValues,
  ) => Promise<void>;
  openWidgetFolder: (widgetName: string) => Promise<void>;
  spawnWidget: (instanceId: string) => Promise<void>;
  closeWidget: (instanceId: string) => Promise<void>;
  createWidget: (options: {
    name: string;
    code: string;
    size: { width: number; height: number };
  }) => Promise<void>;
  updateWidgetSource: (widgetName: string, code: string) => Promise<void>;
  updateWidgetSize: (
    widgetName: string,
    size: { width: number; height: number },
  ) => Promise<void>;
  deleteWidget: (widgetName: string) => Promise<void>;
  checkWidgetExists: (name: string) => Promise<boolean>;
  arrangeWidgets: () => Promise<void>;
}

export const WidgetStoreContext = createContext<WidgetStore | null>(null);

export function useWidgetStore(): WidgetStore {
  const [widgets, setWidgets] = useState<WidgetState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);

  const fetchWidgets = useCallback(async () => {
    if (!ipc()) {
      setLoading(false);
      setError('IPC not available');
      return;
    }

    try {
      if (!initialFetchDone.current) {
        setLoading(true);
      }
      setError(null);
      const result = await ipc().invoke<WidgetState[]>('widget:list');
      setWidgets(result);
      initialFetchDone.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load widgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWidgets();

    const renderer = ipc();
    if (!renderer) return;

    const handleChanged = () => {
      fetchWidgets();
    };

    renderer.on('widget:changed', handleChanged);
    renderer.on('widget:removed', handleChanged);

    return () => {
      renderer.off('widget:changed', handleChanged);
      renderer.off('widget:removed', handleChanged);
    };
  }, [fetchWidgets]);

  const buildWidget = useCallback(
    async (widgetName: string): Promise<WidgetBuildResult> => {
      if (!ipc()) throw new Error('IPC not available');
      return ipc().invoke<WidgetBuildResult>('widget:build', widgetName);
    },
    [],
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
      return instance;
    },
    [],
  );

  const removeWidgetFromScreen = useCallback(
    async (instanceId: string): Promise<void> => {
      if (!ipc()) return;
      await ipc().invoke('widget:close', instanceId);
      await ipc().invoke('widget:remove-instance', instanceId);
    },
    [],
  );

  const updateWidgetVariables = useCallback(
    async (
      widgetName: string,
      variables: WidgetVariableValues,
    ): Promise<void> => {
      if (!ipc()) return;
      await ipc().invoke('widget:set-variables', widgetName, variables);
    },
    [],
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

  const createWidget = useCallback(
    async (options: {
      name: string;
      code: string;
      size: { width: number; height: number };
    }): Promise<void> => {
      if (!ipc()) throw new Error('IPC not available');
      await ipc().invoke('widget:create', options);
    },
    [],
  );

  const updateWidgetSource = useCallback(
    async (widgetName: string, code: string): Promise<void> => {
      if (!ipc()) throw new Error('IPC not available');
      await ipc().invoke('widget:update-source', widgetName, code);
    },
    [],
  );

  const updateWidgetSize = useCallback(
    async (
      widgetName: string,
      size: { width: number; height: number },
    ): Promise<void> => {
      if (!ipc()) throw new Error('IPC not available');
      await ipc().invoke('widget:update-size', widgetName, size);
    },
    [],
  );

  const deleteWidget = useCallback(
    async (widgetName: string): Promise<void> => {
      if (!ipc()) return;
      await ipc().invoke('widget:delete', widgetName);
    },
    [],
  );

  const checkWidgetExists = useCallback(
    async (name: string): Promise<boolean> => {
      if (!ipc()) throw new Error('IPC not available');
      return ipc().invoke<boolean>('widget:exists', name);
    },
    [],
  );

  const arrangeWidgets = useCallback(async (): Promise<void> => {
    if (!ipc()) return;
    await ipc().invoke('widget:arrange');
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
    createWidget,
    updateWidgetSource,
    updateWidgetSize,
    deleteWidget,
    checkWidgetExists,
    arrangeWidgets,
  };
}

export function useWidgets(): WidgetStore {
  const store = useContext(WidgetStoreContext);
  if (!store) {
    throw new Error('useWidgets must be used within a WidgetStoreProvider');
  }
  return store;
}
