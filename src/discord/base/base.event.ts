import type { BaseEvent } from "./base.types.js";

export abstract class BaseEventBuilder implements BaseEvent {
  public abstract name: string;
  public once?: boolean = false;
  
  public abstract execute(...args: any[]): Promise<void>;

  protected log(message: string, ...args: any[]): void {
    console.log(`[${this.name}] ${message}`, ...args);
  }

  protected error(message: string, error?: any): void {
    console.error(`[${this.name}] ${message}`, error);
  }

  protected warn(message: string, ...args: any[]): void {
    console.warn(`[${this.name}] ${message}`, ...args);
  }

  protected info(message: string, ...args: any[]): void {
    console.info(`[${this.name}] ${message}`, ...args);
  }

  protected debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.name}] ${message}`, ...args);
    }
  }
}