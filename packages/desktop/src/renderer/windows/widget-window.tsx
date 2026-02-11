import { useEffect, useState } from 'react';

import { WidgetProvider } from '@wigify/api';
import type { WidgetWindowPayload } from '@wigify/types';
import { compileWidgetSource } from '../lib/widget-runtime';

interface WidgetWindowProps {
  payload: WidgetWindowPayload;
}

type WidgetComponent = React.ComponentType<Record<string, never>>;

export default function WidgetWindow({ payload }: WidgetWindowProps) {
  const [Widget, setWidget] = useState<WidgetComponent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const result = compileWidgetSource(payload.sourceCode);

    if (result.error) {
      setWidget(null);
      setError(result.error);
      return;
    }

    setWidget(() => result.component);
    setError(null);
  }, [payload.sourceCode]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm text-red-400">Widget Error</p>
          <p className="mt-1 text-xs text-red-300/70">{error}</p>
        </div>
      </div>
    );
  }

  if (!Widget) {
    return null;
  }

  return (
    <div
      className="h-screen w-screen"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <WidgetProvider
        variables={payload.variables}
        instanceId={payload.instanceId}
        widgetName={payload.widgetName}
        onRefresh={handleRefresh}
      >
        <Widget />
      </WidgetProvider>
    </div>
  );
}
