import { safeStorage } from 'electron';

export function encryptSecret(value: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption is not available on this system');
  }
  const encrypted = safeStorage.encryptString(value);
  return encrypted.toString('base64');
}

export function decryptSecret(encryptedValue: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption is not available on this system');
  }
  const buffer = Buffer.from(encryptedValue, 'base64');
  return safeStorage.decryptString(buffer);
}

export function isEncryptionAvailable(): boolean {
  return safeStorage.isEncryptionAvailable();
}
