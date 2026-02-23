import type { ReactNode } from 'react';
import { useCallback } from 'react';

import type { WidgetVariableValues } from '@/types';

import { WidgetContext } from './context';

export interface WidgetProviderProps {
  children: ReactNode;
  variables: WidgetVariableValues;
  instanceId: string;
  widgetName: string;
  onRefresh?: () => void;
}

export function WidgetProvider({
  children,
  variables,
  instanceId,
  widgetName,
  onRefresh,
}: WidgetProviderProps): ReactNode {
  const refresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  return (
    <WidgetContext.Provider
      value={{ variables, instanceId, widgetName, refresh }}
    >
      {children}
    </WidgetContext.Provider>
  );
}
