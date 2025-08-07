import { z } from "zod";
import { logger } from "./logger.js";
import { ConfigurationError } from "./error.js";

// Configuration schemas
const DatabaseConfigSchema = z.object({
  url: z.string().url().optional(),
  host: z.string().optional(),
  port: z.number().int().positive().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
});

const DiscordConfigSchema = z.object({
  token: z.string().min(1, "Discord token is required"),
  clientId: z.string().min(1, "Discord client ID is required"),
  guildId: z.string().optional(),
  intents: z.array(z.string()).default([
    "Guilds",
    "GuildMessages", 
    "MessageContent",
    "GuildMembers"
  ]),
});

const LoggingConfigSchema = z.object({
  level: z.enum(["error", "warn", "info", "debug", "trace"]).default("info"),
  format: z.enum(["json", "text"]).default("text"),
  enableFile: z.boolean().default(false),
  filePath: z.string().optional(),
  maxLogs: z.number().int().positive().default(1000),
});

const CacheConfigSchema = z.object({
  enabled: z.boolean().default(true),
  ttl: z.number().int().positive().default(300), // 5 minutes
  maxSize: z.number().int().positive().default(1000),
});

const AppConfigSchema = z.object({
  nodeEnv: z.enum(["development", "production", "test"]).default("development"),
  port: z.number().int().positive().default(3000),
  host: z.string().default("localhost"),
  cors: z.object({
    enabled: z.boolean().default(false),
    origins: z.array(z.string()).default([]),
  }).default({}),
});

// Main configuration schema
const ConfigSchema = z.object({
  app: AppConfigSchema,
  discord: DiscordConfigSchema,
  logging: LoggingConfigSchema,
  cache: CacheConfigSchema,
  database: DatabaseConfigSchema.optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
export type DiscordConfig = z.infer<typeof DiscordConfigSchema>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export type CacheConfig = z.infer<typeof CacheConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;

class ConfigurationManager {
  private config: Config | null = null;
  private readonly configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || process.env.CONFIG_PATH || './config.json';
  }

  async load(): Promise<Config> {
    if (this.config) {
      return this.config;
    }

    try {
      // Load from environment variables first
      const envConfig = this.loadFromEnvironment();
      
      // Try to load from file if it exists
      let fileConfig = {};
      try {
        const fs = await import('fs/promises');
        const configFile = await fs.readFile(this.configPath, 'utf-8');
        fileConfig = JSON.parse(configFile);
      } catch (error) {
        logger.debug(`No config file found at ${this.configPath}, using environment variables only`);
      }

      // Merge configurations (env takes precedence)
      const mergedConfig = this.mergeConfigs(fileConfig, envConfig);
      
      // Validate configuration
      const result = ConfigSchema.safeParse(mergedConfig);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        throw new ConfigurationError("Invalid configuration", {
          details: errors
        });
      }

      this.config = result.data;
      logger.info("Configuration loaded successfully", "Config");
      
      return this.config;
    } catch (error) {
      logger.error("Failed to load configuration", "Config", error);
      throw error;
    }
  }

  private loadFromEnvironment(): Partial<Config> {
    return {
      app: {
        nodeEnv: process.env.NODE_ENV as any,
        port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
        host: process.env.HOST,
        cors: {
          enabled: process.env.CORS_ENABLED === 'true',
          origins: process.env.CORS_ORIGINS?.split(',') || [],
        },
      },
      discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.DISCORD_CLIENT_ID,
        guildId: process.env.DISCORD_GUILD_ID,
        intents: process.env.DISCORD_INTENTS?.split(',') || undefined,
      },
      logging: {
        level: process.env.LOG_LEVEL as any,
        format: process.env.LOG_FORMAT as any,
        enableFile: process.env.LOG_FILE_ENABLED === 'true',
        filePath: process.env.LOG_FILE_PATH,
        maxLogs: process.env.LOG_MAX_LOGS ? parseInt(process.env.LOG_MAX_LOGS) : undefined,
      },
      cache: {
        enabled: process.env.CACHE_ENABLED !== 'false',
        ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL) : undefined,
        maxSize: process.env.CACHE_MAX_SIZE ? parseInt(process.env.CACHE_MAX_SIZE) : undefined,
      },
      database: {
        url: process.env.DATABASE_URL,
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : undefined,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
      },
    };
  }

  private mergeConfigs(fileConfig: any, envConfig: any): any {
    const merge = (target: any, source: any): any => {
      for (const key in source) {
        if (source[key] !== undefined && source[key] !== null) {
          if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = target[key] || {};
            merge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
      return target;
    };

    return merge({}, { ...fileConfig, ...envConfig });
  }

  get(): Config {
    if (!this.config) {
      throw new ConfigurationError("Configuration not loaded. Call load() first.");
    }
    return this.config;
  }

  getDiscord(): DiscordConfig {
    return this.get().discord;
  }

  getLogging(): LoggingConfig {
    return this.get().logging;
  }

  getCache(): CacheConfig {
    return this.get().cache;
  }

  getApp(): AppConfig {
    return this.get().app;
  }

  isDevelopment(): boolean {
    return this.get().app.nodeEnv === 'development';
  }

  isProduction(): boolean {
    return this.get().app.nodeEnv === 'production';
  }

  isTest(): boolean {
    return this.get().app.nodeEnv === 'test';
  }

  async reload(): Promise<Config> {
    this.config = null;
    return this.load();
  }
}

// Export singleton instance
export const config = new ConfigurationManager();

// Helper functions for backward compatibility
export function getConfig(): Config {
  return config.get();
}

export function getDiscordConfig(): DiscordConfig {
  return config.getDiscord();
}

export function getLoggingConfig(): LoggingConfig {
  return config.getLogging();
}

export function isDevelopment(): boolean {
  return config.isDevelopment();
}

export function isProduction(): boolean {
  return config.isProduction();
}