export { WidgetContext, useWidgetContext } from "./context";
export type { WidgetContextValue } from "./context";

export { WidgetProvider } from "./provider";
export type { WidgetProviderProps } from "./provider";

export {
  useVariable,
  useVariables,
  useRefresh,
  useInterval,
  useAutoRefresh,
  useWidgetInfo,
} from "./hooks";

export type {
  WidgetManifest,
  WidgetVariableDefinition,
  WidgetVariableType,
  WidgetVariableValues,
  WidgetSize,
  WidgetPosition,
  WidgetInstance,
} from "@wigify/types";
