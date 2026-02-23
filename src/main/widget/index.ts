export { registerWidgetIpc } from './ipc';

export {
  ensureConfigDirectories,
  getEnabledWidgetInstances,
  listAllWidgets,
  loadWidgetState,
  loadWidgetConfig,
  saveWidgetConfig,
  addWidgetInstance,
  removeWidgetInstance,
  updateWidgetInstance,
  getWidgetInstance,
  readWidgetManifest,
  readWidgetVariables,
  writeWidgetVariables,
  getWidgetBundlePath,
  getWidgetSourcePath,
  readWidgetSource,
  getWidgetPath,
  getWidgetLocation,
  listAllWidgetLocations,
  createWidget,
  deleteWidget,
  updateWidgetSource,
  widgetExists,
  isWidgetBuilt,
} from './fs';
export type { WidgetSource, WidgetLocation, CreateWidgetOptions } from './fs';

export { buildWidget, watchWidget } from './bundler';

export {
  spawnWidgetWindow,
  closeWidgetWindow,
  getWidgetWindow,
  getAllWidgetWindows,
  closeAllWidgetWindows,
  updateWidgetWindowPosition,
  updateWidgetWindowSize,
  setAppQuitting,
} from './manager';

export { WidgetContext, useWidgetContext } from './context';
export type { WidgetContextValue } from './context';

export { WidgetProvider } from './provider';
export type { WidgetProviderProps } from './provider';

export {
  useVariable,
  useVariables,
  useRefresh,
  useInterval,
  useAutoRefresh,
  useWidgetInfo,
} from './hooks';
