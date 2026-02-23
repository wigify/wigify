import { lazy, Suspense, useEffect, useState } from 'react';

import type { WindowData } from '@/types';
import {
  WidgetStoreContext,
  useWidgetStore,
} from '@/renderer/hooks/use-widgets';

const MainWindow = lazy(() => import('./windows/main'));

function WidgetStoreProvider({ children }: { children: React.ReactNode }) {
  const store = useWidgetStore();
  return (
    <WidgetStoreContext.Provider value={store}>
      {children}
    </WidgetStoreContext.Provider>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="border-muted border-t-foreground h-8 w-8 animate-spin rounded-full border-4" />
    </div>
  );
}

function NoIpcScreen() {
  return (
    <div className="bg-background flex h-screen w-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-lg font-semibold text-white">Electron Required</h1>
      <p className="text-center text-sm text-white/60">
        This app must be run through Electron, not in a browser.
        <br />
        Please run <code className="text-white/80">bun dev</code> to start the
        app.
      </p>
    </div>
  );
}

export default function App() {
  const [windowData, setWindowData] = useState<WindowData | null>(null);
  const [ipcAvailable, setIpcAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!window.ipcRenderer) {
      setIpcAvailable(false);
      return;
    }

    setIpcAvailable(true);

    const handleLoad = (_: unknown, ...args: unknown[]) => {
      const data = args[0] as WindowData;
      setWindowData(data);
    };

    window.ipcRenderer.on('load', handleLoad);
    return () => {
      window.ipcRenderer.off('load', handleLoad);
    };
  }, []);

  if (ipcAvailable === false) {
    return <NoIpcScreen />;
  }

  if (!windowData) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {windowData.type === 'main' && (
        <WidgetStoreProvider>
          <MainWindow />
        </WidgetStoreProvider>
      )}
    </Suspense>
  );
}
