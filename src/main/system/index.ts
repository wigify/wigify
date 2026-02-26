export {
  startCursorProximityTracking,
  stopCursorProximityTracking,
  isTrackingActive,
  removeWidgetFromTracking,
} from '@/main/system/cursor-proximity';

export { registerFetchProxyIpc } from '@/main/system/fetch-proxy';

export {
  encryptSecret,
  decryptSecret,
  isEncryptionAvailable,
} from '@/main/system/secrets';

export {
  loadSettings,
  saveSettings,
  updateSetting,
} from '@/main/system/settings';

export {
  checkForUpdates,
  getUpdateStatus,
  initAutoUpdater,
  installUpdate,
  registerUpdaterIpc,
  setOnStatusChange,
} from '@/main/system/updater';
export type { UpdateState } from '@/main/system/updater';
