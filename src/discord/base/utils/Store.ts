export class Store<T = any> {
  private data = new Map<string, T>();

  set(key: string, value: T): void {
    this.data.set(key, value);
  }

  get(key: string): T | undefined {
    return this.data.get(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  delete(key: string): boolean {
    return this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  size(): number {
    return this.data.size;
  }

  keys(): IterableIterator<string> {
    return this.data.keys();
  }

  values(): IterableIterator<T> {
    return this.data.values();
  }

  entries(): IterableIterator<[string, T]> {
    return this.data.entries();
  }

  forEach(callback: (value: T, key: string, map: Map<string, T>) => void): void {
    this.data.forEach(callback);
  }

  toArray(): T[] {
    return Array.from(this.data.values());
  }

  toObject(): Record<string, T> {
    const obj: Record<string, T> = {};
    for (const [key, value] of this.data) {
      obj[key] = value;
    }
    return obj;
  }

  filter(predicate: (value: T, key: string) => boolean): T[] {
    const result: T[] = [];
    for (const [key, value] of this.data) {
      if (predicate(value, key)) {
        result.push(value);
      }
    }
    return result;
  }

  find(predicate: (value: T, key: string) => boolean): T | undefined {
    for (const [key, value] of this.data) {
      if (predicate(value, key)) {
        return value;
      }
    }
    return undefined;
  }
}