export { registerWidgetIpc } from '@/main/widget/ipc';

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
} from '@/main/widget/fs';
export type {
  WidgetSource,
  WidgetLocation,
  CreateWidgetOptions,
} from '@/main/widget/fs';

export { buildWidget, watchWidget } from '@/main/widget/bundler';

export {
  spawnWidgetWindow,
  closeWidgetWindow,
  getWidgetWindow,
  getAllWidgetWindows,
  closeAllWidgetWindows,
  updateWidgetWindowPosition,
  updateWidgetWindowSize,
  setAppQuitting,
} from '@/main/widget/manager';

export { WidgetContext, useWidgetContext } from '@/main/widget/context';
export type { WidgetContextValue } from '@/main/widget/context';

export { WidgetProvider } from '@/main/widget/provider';
export type { WidgetProviderProps } from '@/main/widget/provider';

export {
  useVariable,
  useVariables,
  useRefresh,
  useInterval,
  useAutoRefresh,
  useWidgetInfo,
} from '@/main/widget/hooks';
