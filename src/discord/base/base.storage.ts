import type { BaseStorage } from "./base.types.js";

export class BaseStorageImpl implements BaseStorage {
  private storage = new Map<string, any>();

  get(key: string): any {
    return this.storage.get(key);
  }

  set(key: string, value: any): void {
    this.storage.set(key, value);
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  has(key: string): boolean {
    return this.storage.has(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

export const storage = new BaseStorageImpl();