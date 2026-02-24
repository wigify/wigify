import { useCallback, useEffect, useState } from 'react';
import { Download, RefreshCw, X } from 'lucide-react';

type UpdateStatus = 'idle' | 'downloading' | 'ready';

export default function UpdateToast() {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [version, setVersion] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!window.ipcRenderer) return;

    const handleAvailable = (_: unknown, v: unknown) => {
      setStatus('downloading');
      setVersion(v as string);
    };

    const handleDownloaded = (_: unknown, v: unknown) => {
      setStatus('ready');
      setVersion(v as string);
      setDismissed(false);
    };

    window.ipcRenderer.on('updater:available', handleAvailable);
    window.ipcRenderer.on('updater:downloaded', handleDownloaded);

    return () => {
      window.ipcRenderer.off('updater:available', handleAvailable);
      window.ipcRenderer.off('updater:downloaded', handleDownloaded);
    };
  }, []);

  const handleRestart = useCallback(() => {
    window.ipcRenderer.invoke('updater:install');
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  if (status === 'idle' || dismissed) return null;

  return (
    <div className="border-border bg-popover text-popover-foreground fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg">
      {status === 'downloading' && (
        <>
          <Download className="h-4 w-4 shrink-0 animate-pulse" />
          <span>Downloading update v{version}...</span>
        </>
      )}
      {status === 'ready' && (
        <>
          <RefreshCw className="h-4 w-4 shrink-0" />
          <span>v{version} ready.</span>
          <button
            onClick={handleRestart}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1 text-xs font-medium transition-colors"
          >
            Restart
          </button>
          <button
            onClick={handleDismiss}
            className="hover:bg-accent rounded-md p-1 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
