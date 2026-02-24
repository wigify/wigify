export {
  startCursorProximityTracking,
  stopCursorProximityTracking,
  isTrackingActive,
  removeWidgetFromTracking,
} from '@/main/system/cursor-proximity';

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

export { initAutoUpdater, registerUpdaterIpc } from '@/main/system/updater';
