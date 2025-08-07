import { GuildMember, User, Guild, Channel, GuildBasedChannel } from "discord.js";

/**
 * Utility functions for common operations
 */

export class Utils {
  /**
   * Format a duration in milliseconds to a human-readable string
   */
  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Format a number with commas
   */
  static formatNumber(num: number): string {
    return num.toLocaleString();
  }

  /**
   * Truncate a string to a maximum length
   */
  static truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Generate a random string
   */
  static randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Check if a string is a valid Discord ID
   */
  static isValidDiscordId(id: string): boolean {
    return /^\d{17,19}$/.test(id);
  }

  /**
   * Check if a string is a valid Discord invite code
   */
  static isValidInviteCode(code: string): boolean {
    return /^[a-zA-Z0-9-]+$/.test(code);
  }

  /**
   * Escape markdown characters
   */
  static escapeMarkdown(text: string): string {
    return text.replace(/[\\*_`~|\[\]()>#+=!{}.!-]/g, '\\$&');
  }

  /**
   * Get user display name
   */
  static getDisplayName(user: User, member?: GuildMember): string {
    if (member?.displayName) return member.displayName;
    return user.displayName || user.username;
  }

  /**
   * Get user avatar URL
   */
  static getAvatarURL(user: User, member?: GuildMember, size: number = 256): string {
    return member?.displayAvatarURL({ size }) || user.displayAvatarURL({ size });
  }

  /**
   * Check if a user has a specific permission
   */
  static hasPermission(member: GuildMember, permission: string): boolean {
    return member.permissions.has(permission as any);
  }

  /**
   * Get channel mention
   */
  static getChannelMention(channel: Channel | GuildBasedChannel): string {
    if ('id' in channel) {
      return `<#${channel.id}>`;
    }
    return channel.toString();
  }

  /**
   * Get user mention
   */
  static getUserMention(user: User): string {
    return `<@${user.id}>`;
  }

  /**
   * Get role mention
   */
  static getRoleMention(roleId: string): string {
    return `<@&${roleId}>`;
  }

  /**
   * Convert bytes to human readable format
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Debounce function
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Deep clone an object
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => Utils.deepClone(item)) as any;
    if (typeof obj === 'object') {
      const clonedObj = {} as any;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = Utils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  }

  /**
   * Check if two objects are deeply equal
   */
  static deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 !== 'object') return obj1 === obj2;
    
    if (obj1 instanceof Date && obj2 instanceof Date) {
      return obj1.getTime() === obj2.getTime();
    }
    
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      for (let i = 0; i < obj1.length; i++) {
        if (!Utils.deepEqual(obj1[i], obj2[i])) return false;
      }
      return true;
    }
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!Utils.deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  }

  /**
   * Generate a progress bar
   */
  static createProgressBar(current: number, total: number, length: number = 10): string {
    const percentage = current / total;
    const filledLength = Math.round(length * percentage);
    const emptyLength = length - filledLength;
    
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    
    return `${filled}${empty} ${Math.round(percentage * 100)}%`;
  }

  /**
   * Convert a string to title case
   */
  static toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Generate a UUID v4
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Sleep for a specified amount of time
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await Utils.sleep(delay);
      }
    }
    
    throw lastError!;
  }
}

export default Utils;