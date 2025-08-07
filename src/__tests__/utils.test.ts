import { Utils } from '../shared/utils.js';

describe('Utils', () => {
  describe('formatDuration', () => {
    it('should format milliseconds to human readable string', () => {
      expect(Utils.formatDuration(1000)).toBe('1s');
      expect(Utils.formatDuration(60000)).toBe('1m 0s');
      expect(Utils.formatDuration(3661000)).toBe('1h 1m 1s');
      expect(Utils.formatDuration(90061000)).toBe('1d 1h 1m 1s');
    });

    it('should handle zero duration', () => {
      expect(Utils.formatDuration(0)).toBe('0s');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(Utils.formatNumber(1000)).toBe('1,000');
      expect(Utils.formatNumber(1000000)).toBe('1,000,000');
      expect(Utils.formatNumber(123)).toBe('123');
    });
  });

  describe('truncate', () => {
    it('should truncate strings longer than max length', () => {
      expect(Utils.truncate('Hello World', 5)).toBe('He...');
      expect(Utils.truncate('Short', 10)).toBe('Short');
    });

    it('should use custom suffix', () => {
      expect(Utils.truncate('Hello World', 5, '***')).toBe('He***');
    });
  });

  describe('randomString', () => {
    it('should generate string of specified length', () => {
      const result = Utils.randomString(10);
      expect(result).toHaveLength(10);
      expect(typeof result).toBe('string');
    });

    it('should generate different strings', () => {
      const str1 = Utils.randomString(10);
      const str2 = Utils.randomString(10);
      expect(str1).not.toBe(str2);
    });
  });

  describe('isValidDiscordId', () => {
    it('should validate Discord IDs', () => {
      expect(Utils.isValidDiscordId('123456789012345678')).toBe(true);
      expect(Utils.isValidDiscordId('12345678901234567')).toBe(true);
      expect(Utils.isValidDiscordId('1234567890123456789')).toBe(true);
      expect(Utils.isValidDiscordId('1234567890123456')).toBe(false); // Too short
      expect(Utils.isValidDiscordId('12345678901234567890')).toBe(false); // Too long
      expect(Utils.isValidDiscordId('abc123')).toBe(false); // Not numeric
    });
  });

  describe('isValidInviteCode', () => {
    it('should validate Discord invite codes', () => {
      expect(Utils.isValidInviteCode('abc123')).toBe(true);
      expect(Utils.isValidInviteCode('abc-123')).toBe(true);
      expect(Utils.isValidInviteCode('abc_123')).toBe(false); // Underscore not allowed
      expect(Utils.isValidInviteCode('abc 123')).toBe(false); // Space not allowed
    });
  });

  describe('escapeMarkdown', () => {
    it('should escape markdown characters', () => {
      expect(Utils.escapeMarkdown('*bold*')).toBe('\\*bold\\*');
      expect(Utils.escapeMarkdown('_italic_')).toBe('\\_italic\\_');
      expect(Utils.escapeMarkdown('`code`')).toBe('\\`code\\`');
      expect(Utils.escapeMarkdown('> quote')).toBe('\\> quote');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes to human readable format', () => {
      expect(Utils.formatBytes(0)).toBe('0 Bytes');
      expect(Utils.formatBytes(1024)).toBe('1 KB');
      expect(Utils.formatBytes(1048576)).toBe('1 MB');
      expect(Utils.formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('createProgressBar', () => {
    it('should create progress bar with correct percentage', () => {
      const bar = Utils.createProgressBar(5, 10);
      expect(bar).toContain('50%');
      expect(bar).toContain('█');
      expect(bar).toContain('░');
    });

    it('should handle 0% progress', () => {
      const bar = Utils.createProgressBar(0, 10);
      expect(bar).toContain('0%');
    });

    it('should handle 100% progress', () => {
      const bar = Utils.createProgressBar(10, 10);
      expect(bar).toContain('100%');
    });
  });

  describe('toTitleCase', () => {
    it('should convert string to title case', () => {
      expect(Utils.toTitleCase('hello world')).toBe('Hello World');
      expect(Utils.toTitleCase('HELLO WORLD')).toBe('Hello World');
      expect(Utils.toTitleCase('hElLo WoRlD')).toBe('Hello World');
    });
  });

  describe('generateUUID', () => {
    it('should generate valid UUID format', () => {
      const uuid = Utils.generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate different UUIDs', () => {
      const uuid1 = Utils.generateUUID();
      const uuid2 = Utils.generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('sleep', () => {
    it('should sleep for specified time', async () => {
      const start = Date.now();
      await Utils.sleep(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(100);
    });
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await Utils.retry(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      
      const result = await Utils.retry(fn, 2);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      
      await expect(Utils.retry(fn, 2)).rejects.toThrow('fail');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(Utils.deepClone(42)).toBe(42);
      expect(Utils.deepClone('hello')).toBe('hello');
      expect(Utils.deepClone(true)).toBe(true);
      expect(Utils.deepClone(null)).toBe(null);
    });

    it('should clone objects', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = Utils.deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });

    it('should clone arrays', () => {
      const original = [1, [2, 3], { a: 4 }];
      const cloned = Utils.deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[1]).not.toBe(original[1]);
      expect(cloned[2]).not.toBe(original[2]);
    });

    it('should clone dates', () => {
      const original = new Date('2023-01-01');
      const cloned = Utils.deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });
  });

  describe('deepEqual', () => {
    it('should compare primitive values', () => {
      expect(Utils.deepEqual(1, 1)).toBe(true);
      expect(Utils.deepEqual('hello', 'hello')).toBe(true);
      expect(Utils.deepEqual(1, 2)).toBe(false);
    });

    it('should compare objects', () => {
      expect(Utils.deepEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(Utils.deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(Utils.deepEqual({ a: 1 }, { b: 1 })).toBe(false);
    });

    it('should compare arrays', () => {
      expect(Utils.deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(Utils.deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('should compare dates', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      const date3 = new Date('2023-01-02');
      
      expect(Utils.deepEqual(date1, date2)).toBe(true);
      expect(Utils.deepEqual(date1, date3)).toBe(false);
    });
  });
});