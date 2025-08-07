export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
  traceId?: string;
  userId?: string;
  guildId?: string;
  channelId?: string;
}

export interface LoggerOptions {
  level?: LogLevel;
  maxLogs?: number;
  enableConsole?: boolean;
  enableFile?: boolean;
  filePath?: string;
  format?: 'json' | 'text';
  includeTimestamp?: boolean;
  includeContext?: boolean;
}

export class Logger {
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number;
  private enableConsole: boolean;
  private enableFile: boolean;
  private filePath?: string;
  private format: 'json' | 'text';
  private includeTimestamp: boolean;
  private includeContext: boolean;
  private traceIdCounter = 0;

  constructor(options: LoggerOptions = {}) {
    this.logLevel = options.level ?? LogLevel.INFO;
    this.maxLogs = options.maxLogs ?? 1000;
    this.enableConsole = options.enableConsole ?? true;
    this.enableFile = options.enableFile ?? false;
    this.filePath = options.filePath;
    this.format = options.format ?? 'text';
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.includeContext = options.includeContext ?? true;
  }

  private generateTraceId(): string {
    return `trace_${++this.traceIdCounter}_${Date.now()}`;
  }

  private log(
    level: LogLevel, 
    message: string, 
    context?: string, 
    data?: any,
    metadata?: {
      traceId?: string;
      userId?: string;
      guildId?: string;
      channelId?: string;
    }
  ): void {
    if (level <= this.logLevel) {
      const entry: LogEntry = {
        level,
        message,
        timestamp: new Date(),
        context,
        data,
        traceId: metadata?.traceId || this.generateTraceId(),
        userId: metadata?.userId,
        guildId: metadata?.guildId,
        channelId: metadata?.channelId,
      };

      this.logs.push(entry);
      
      // Keep only the most recent logs
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }

      this.output(entry);
    }
  }

  private output(entry: LogEntry): void {
    if (this.enableConsole) {
      this.outputToConsole(entry);
    }

    if (this.enableFile && this.filePath) {
      this.outputToFile(entry);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const levelColors = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.INFO]: '\x1b[36m',  // Cyan
      [LogLevel.DEBUG]: '\x1b[35m', // Magenta
      [LogLevel.TRACE]: '\x1b[90m', // Gray
    };
    const resetColor = '\x1b[0m';

    if (this.format === 'json') {
      console.log(JSON.stringify(entry));
    } else {
      const timestamp = this.includeTimestamp ? `[${entry.timestamp.toISOString()}]` : '';
      const context = this.includeContext && entry.context ? `[${entry.context}]` : '';
      const traceId = entry.traceId ? `[${entry.traceId}]` : '';
      const color = levelColors[entry.level] || '';
      
      const message = `${color}${timestamp} ${levelName} ${context} ${traceId} ${entry.message}${resetColor}`;
      
      switch (entry.level) {
        case LogLevel.ERROR:
          console.error(message, entry.data || '');
          break;
        case LogLevel.WARN:
          console.warn(message, entry.data || '');
          break;
        case LogLevel.INFO:
          console.info(message, entry.data || '');
          break;
        case LogLevel.DEBUG:
          console.debug(message, entry.data || '');
          break;
        case LogLevel.TRACE:
          console.trace(message, entry.data || '');
          break;
      }
    }
  }

  private async outputToFile(entry: LogEntry): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const logLine = this.format === 'json' 
        ? JSON.stringify(entry) + '\n'
        : `${entry.timestamp.toISOString()} ${LogLevel[entry.level]} ${entry.context || ''} ${entry.message}\n`;
      
      await fs.appendFile(this.filePath!, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  error(message: string, context?: string, data?: any, metadata?: any): void {
    this.log(LogLevel.ERROR, message, context, data, metadata);
  }

  warn(message: string, context?: string, data?: any, metadata?: any): void {
    this.log(LogLevel.WARN, message, context, data, metadata);
  }

  info(message: string, context?: string, data?: any, metadata?: any): void {
    this.log(LogLevel.INFO, message, context, data, metadata);
  }

  debug(message: string, context?: string, data?: any, metadata?: any): void {
    this.log(LogLevel.DEBUG, message, context, data, metadata);
  }

  trace(message: string, context?: string, data?: any, metadata?: any): void {
    this.log(LogLevel.TRACE, message, context, data, metadata);
  }

  // Discord-specific logging methods
  logInteraction(
    level: LogLevel,
    message: string,
    interaction: any,
    data?: any
  ): void {
    const metadata = {
      userId: interaction.user?.id,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
    };
    
    this.log(level, message, 'Interaction', data, metadata);
  }

  logCommand(
    level: LogLevel,
    commandName: string,
    interaction: any,
    data?: any
  ): void {
    const metadata = {
      userId: interaction.user?.id,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
    };
    
    this.log(level, `Command: ${commandName}`, 'Command', data, metadata);
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  getLevel(): LogLevel {
    return this.logLevel;
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  // Performance monitoring
  time<T>(label: string, fn: () => T | Promise<T>): Promise<T> {
    const start = performance.now();
    this.debug(`Starting: ${label}`, 'Performance');
    
    return Promise.resolve(fn()).then(result => {
      const duration = performance.now() - start;
      this.debug(`Completed: ${label} (${duration.toFixed(2)}ms)`, 'Performance');
      return result;
    }).catch(error => {
      const duration = performance.now() - start;
      this.error(`Failed: ${label} (${duration.toFixed(2)}ms)`, 'Performance', error);
      throw error;
    });
  }
}

// Create default logger instance
export const logger = new Logger({
  level: process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO,
  format: process.env.NODE_ENV === "production" ? 'json' : 'text',
  enableFile: process.env.NODE_ENV === "production",
  filePath: process.env.NODE_ENV === "production" ? './logs/app.log' : undefined,
});