import { lazy, Suspense, useEffect, useState } from 'react';
import type { WindowData } from '@/types/window';

const MainWindow = lazy(() => import('./windows/main-window'));

function LoadingScreen() {
  return (
    <div className="bg-background flex h-screen w-screen items-center justify-center">
      <div className="border-muted border-t-foreground h-8 w-8 animate-spin rounded-full border-4" />
    </div>
  );
}

export default function App() {
  const [windowData, setWindowData] = useState<WindowData | null>(null);

  useEffect(() => {
    if (!window.ipcRenderer) {
      setWindowData({ type: 'main' });
      return;
    }

    const handleLoad = (_: unknown, ...args: unknown[]) => {
      const data = args[0] as WindowData;
      setWindowData(data);
    };

    window.ipcRenderer.on('load', handleLoad);
    return () => {
      window.ipcRenderer.off('load', handleLoad);
    };
  }, []);

  if (!windowData) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {windowData.type === 'main' && <MainWindow />}
    </Suspense>
  );
}
