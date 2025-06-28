import { Store } from "./Store.js";

export interface URLData {
  url: string;
  title?: string;
  description?: string;
  timestamp: number;
  userId: string;
  guildId?: string;
}

export class URLStore extends Store<URLData> {
  addURL(key: string, url: string, userId: string, options?: {
    title?: string;
    description?: string;
    guildId?: string;
  }): void {
    const urlData: URLData = {
      url,
      userId,
      timestamp: Date.now(),
      ...options
    };
    
    this.set(key, urlData);
  }

  getURL(key: string): string | undefined {
    const data = this.get(key);
    return data?.url;
  }

  getUserURLs(userId: string): URLData[] {
    return this.filter((data) => data.userId === userId);
  }

  getGuildURLs(guildId: string): URLData[] {
    return this.filter((data) => data.guildId === guildId);
  }

  getRecentURLs(limit: number = 10): URLData[] {
    return this.toArray()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  cleanupOldURLs(maxAge: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, data] of this.entries()) {
      if (now - data.timestamp > maxAge) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }

  isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const urlStore = new URLStore();