export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
}

export class Logger {
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (level <= this.logLevel) {
      const entry: LogEntry = {
        level,
        message,
        timestamp: new Date(),
        context,
        data
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
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : "";
    const levelName = LogLevel[entry.level];
    
    const message = `${timestamp} ${levelName} ${context} ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(message, entry.data || "");
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || "");
        break;
      case LogLevel.INFO:
        console.info(message, entry.data || "");
        break;
      case LogLevel.DEBUG:
        console.debug(message, entry.data || "");
        break;
    }
  }

  error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
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
}

export const logger = new Logger(
  process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO
);