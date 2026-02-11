import { createContext, useContext } from "react";

import type { WidgetVariableValues } from "@wigify/types";

export interface WidgetContextValue {
  variables: WidgetVariableValues;
  instanceId: string;
  widgetName: string;
  refresh: () => void;
}

export const WidgetContext = createContext<WidgetContextValue | null>(null);

export function useWidgetContext(): WidgetContextValue {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidgetContext must be used within a WidgetProvider");
  }
  return context;
}
