export enum BotStatus {
  STARTING = "starting",
  READY = "ready",
  ERROR = "error",
  MAINTENANCE = "maintenance",
  SHUTDOWN = "shutdown"
}

export interface StatusInfo {
  status: BotStatus;
  uptime: number;
  guilds: number;
  users: number;
  commands: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  lastUpdate: Date;
}

export class StatusManager {
  private currentStatus: BotStatus = BotStatus.STARTING;
  private startTime: Date = new Date();
  private statusHistory: Array<{ status: BotStatus; timestamp: Date }> = [];

  setStatus(status: BotStatus): void {
    this.currentStatus = status;
    this.statusHistory.push({ status, timestamp: new Date() });
    
    // Keep only last 100 status changes
    if (this.statusHistory.length > 100) {
      this.statusHistory = this.statusHistory.slice(-100);
    }
  }

  getStatus(): BotStatus {
    return this.currentStatus;
  }

  getUptime(): number {
    return Date.now() - this.startTime.getTime();
  }

  getStatusInfo(client?: any): StatusInfo {
    const memUsage = process.memoryUsage();
    
    return {
      status: this.currentStatus,
      uptime: this.getUptime(),
      guilds: client?.guilds?.cache?.size || 0,
      users: client?.users?.cache?.size || 0,
      commands: client?.commands?.size || 0,
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      lastUpdate: new Date()
    };
  }

  getStatusHistory(): Array<{ status: BotStatus; timestamp: Date }> {
    return [...this.statusHistory];
  }

  isHealthy(): boolean {
    return this.currentStatus === BotStatus.READY;
  }

  formatUptime(): string {
    const uptime = this.getUptime();
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

export const statusManager = new StatusManager();