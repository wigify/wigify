import { useCallback, useEffect, useRef } from "react";

import { useWidgetContext } from "./context";

export function useVariable<T = string>(name: string): T | undefined {
  const { variables } = useWidgetContext();
  return variables[name] as T | undefined;
}

export function useVariables(): Record<string, unknown> {
  const { variables } = useWidgetContext();
  return variables;
}

export function useRefresh(): () => void {
  const { refresh } = useWidgetContext();
  return refresh;
}

export function useInterval(callback: () => void, intervalMs: number): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => savedCallback.current();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

export function useAutoRefresh(intervalMs: number): void {
  const refresh = useRefresh();

  const stableRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  useInterval(stableRefresh, intervalMs);
}

export function useWidgetInfo(): { instanceId: string; widgetName: string } {
  const { instanceId, widgetName } = useWidgetContext();
  return { instanceId, widgetName };
}
