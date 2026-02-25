import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Download, Loader2, X } from 'lucide-react';

import { Progress } from '@/renderer/components/ui/progress';

type UpdateState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'error';

interface UpdateStatus {
  state: UpdateState;
  version?: string;
  progress?: number;
  error?: string;
}

export default function UpdateToast() {
  const [status, setStatus] = useState<UpdateStatus>({ state: 'idle' });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!window.ipcRenderer) return;

    window.ipcRenderer
      .invoke('updater:get-status')
      .then((s: unknown) => setStatus(s as UpdateStatus));

    const handleStatus = (_: unknown, newStatus: unknown) => {
      const s = newStatus as UpdateStatus;
      setStatus(s);
      if (s.state === 'ready') {
        setDismissed(false);
      }
    };

    const handleStartInstall = () => {
      window.ipcRenderer.invoke('updater:install');
    };

    window.ipcRenderer.on('updater:status', handleStatus);
    window.ipcRenderer.on('updater:start-install', handleStartInstall);

    return () => {
      window.ipcRenderer.off('updater:status', handleStatus);
      window.ipcRenderer.off('updater:start-install', handleStartInstall);
    };
  }, []);

  const handleInstall = useCallback(() => {
    window.ipcRenderer.invoke('updater:install');
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  if (status.state === 'idle' || status.state === 'checking' || dismissed) {
    return null;
  }

  return (
    <div className="border-border bg-popover text-popover-foreground fixed right-4 bottom-4 z-50 flex min-w-72 flex-col gap-2 rounded-lg border p-4 text-sm shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {status.state === 'available' && (
            <>
              <Download className="text-primary h-4 w-4 shrink-0" />
              <span>Update v{status.version} available</span>
            </>
          )}
          {status.state === 'downloading' && (
            <>
              <Loader2 className="text-primary h-4 w-4 shrink-0 animate-spin" />
              <span>Downloading v{status.version}...</span>
            </>
          )}
          {status.state === 'ready' && (
            <>
              <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
              <span>v{status.version} ready to install</span>
            </>
          )}
          {status.state === 'error' && (
            <>
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>Update failed</span>
            </>
          )}
        </div>
        {(status.state === 'ready' || status.state === 'error') && (
          <button
            onClick={handleDismiss}
            className="hover:bg-accent -mr-1 rounded-md p-1 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {status.state === 'downloading' && status.progress !== undefined && (
        <div className="flex items-center gap-2">
          <Progress value={status.progress} className="h-1.5 flex-1" />
          <span className="text-muted-foreground w-10 text-right text-xs">
            {status.progress}%
          </span>
        </div>
      )}

      {status.state === 'ready' && (
        <button
          onClick={handleInstall}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-1 w-full rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
        >
          Restart to Update
        </button>
      )}

      {status.state === 'error' && status.error && (
        <p className="text-muted-foreground text-xs">{status.error}</p>
      )}
    </div>
  );
}
