import { z } from "zod";

export const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, "Discord token is required"),
  DISCORD_CLIENT_ID: z.string().min(1, "Discord client ID is required"),
  DISCORD_GUILD_ID: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development")
});