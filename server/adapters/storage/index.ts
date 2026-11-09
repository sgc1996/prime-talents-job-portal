import { StorageAdapter } from "./storage-adapter.interface";
import { LocalStorageAdapter } from "./local-storage-adapter";

let storageAdapterInstance: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!storageAdapterInstance) {
    storageAdapterInstance = new LocalStorageAdapter();
  }
  return storageAdapterInstance;
}

export * from "./storage-adapter.interface";

