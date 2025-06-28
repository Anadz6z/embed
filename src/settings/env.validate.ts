import { envSchema } from "./env.schema.js";
import { createError } from "./error.js";

export function validateEnv() {
  try {
    const env = {
      DISCORD_TOKEN: process.env.DISCORD_TOKEN,
      DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
      DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
      NODE_ENV: process.env.NODE_ENV
    };

    const result = envSchema.safeParse(env);

    if (!result.success) {
      const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw createError("Environment validation failed", {
        code: "ENV_VALIDATION_ERROR",
        details: errors
      });
    }

    return result.data;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Environment validation failed")) {
      throw error;
    }
    
    throw createError("Failed to validate environment variables", {
      code: "ENV_VALIDATION_ERROR",
      cause: error
    });
  }
}

export function getEnvInfo() {
  const env = validateEnv();
  
  return {
    nodeEnv: env.NODE_ENV,
    hasToken: !!env.DISCORD_TOKEN,
    hasClientId: !!env.DISCORD_CLIENT_ID,
    hasGuildId: !!env.DISCORD_GUILD_ID,
    isProduction: env.NODE_ENV === "production",
    isDevelopment: env.NODE_ENV === "development"
  };
}

export function requireEnv(key: keyof ReturnType<typeof validateEnv>): string {
  const env = validateEnv();
  const value = env[key];
  
  if (!value) {
    throw createError(`Required environment variable ${key} is not set`, {
      code: "MISSING_ENV_VAR",
      details: { key }
    });
  }
  
  return value;
}

export function getOptionalEnv(key: keyof ReturnType<typeof validateEnv>, defaultValue?: string): string | undefined {
  try {
    const env = validateEnv();
    return env[key] || defaultValue;
  } catch {
    return defaultValue;
  }
}