import { Client, Collection, GatewayIntentBits, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { BaseAppData, BaseCommand, BaseResponder, BaseEvent } from "./base.types.js";
import { validateEnv } from "../../settings/env.validate.js";
import { logger } from "../../settings/logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function createApp(): Promise<BaseAppData> {
  const env = validateEnv();
  
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers
    ]
  });

  const commands = new Collection<string, BaseCommand>();
  const responders = new Collection<string, BaseResponder>();

  // Load commands
  await loadCommands(commands);
  
  // Load responders
  await loadResponders(responders);
  
  // Load events
  await loadEvents(client);

  // Register slash commands
  await registerCommands(commands, env.DISCORD_TOKEN, env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID);

  // Store collections in client for access in events
  (client as any).commands = commands;
  (client as any).responders = responders;

  await client.login(env.DISCORD_TOKEN);

  logger.info("Discord bot started successfully!");

  return { client, commands, responders };
}

async function loadCommands(commands: Collection<string, BaseCommand>) {
  const commandsPath = join(__dirname, "../commands");
  const commandFolders = readdirSync(commandsPath, { withFileTypes: true });

  for (const folder of commandFolders) {
    if (folder.isDirectory()) {
      const folderPath = join(commandsPath, folder.name);
      const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
      
      for (const file of commandFiles) {
        const filePath = join(folderPath, file);
        const command = await import(filePath);
        
        if ('data' in command.default && 'execute' in command.default) {
          commands.set(command.default.data.name, command.default);
          logger.info(`Loaded command: ${command.default.data.name}`);
        }
      }
    } else if (folder.name.endsWith('.js') || folder.name.endsWith('.ts')) {
      const filePath = join(commandsPath, folder.name);
      const command = await import(filePath);
      
      if ('data' in command.default && 'execute' in command.default) {
        commands.set(command.default.data.name, command.default);
        logger.info(`Loaded command: ${command.default.data.name}`);
      }
    }
  }
}

async function loadResponders(responders: Collection<string, BaseResponder>) {
  const respondersPath = join(__dirname, "../responders");
  const responderFiles = readdirSync(respondersPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

  for (const file of responderFiles) {
    const filePath = join(respondersPath, file);
    const responder = await import(filePath);
    
    if ('customId' in responder.default && 'execute' in responder.default) {
      responders.set(responder.default.customId, responder.default);
      logger.info(`Loaded responder: ${responder.default.customId}`);
    }
  }
}

async function loadEvents(client: Client) {
  const eventsPath = join(__dirname, "../events");
  const eventFolders = readdirSync(eventsPath, { withFileTypes: true });

  for (const folder of eventFolders) {
    if (folder.isDirectory()) {
      const folderPath = join(eventsPath, folder.name);
      const eventFiles = readdirSync(folderPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
      
      for (const file of eventFiles) {
        const filePath = join(folderPath, file);
        const event = await import(filePath);
        
        if ('name' in event.default && 'execute' in event.default) {
          if (event.default.once) {
            client.once(event.default.name, (...args) => event.default.execute(...args));
          } else {
            client.on(event.default.name, (...args) => event.default.execute(...args));
          }
          logger.info(`Loaded event: ${event.default.name}`);
        }
      }
    }
  }
}

async function registerCommands(
  commands: Collection<string, BaseCommand>,
  token: string,
  clientId: string,
  guildId?: string
) {
  const rest = new REST().setToken(token);
  const commandData = commands.map(command => command.data.toJSON());

  try {
    logger.info(`Started refreshing ${commandData.length} application (/) commands.`);

    if (guildId) {
      // Guild-specific commands for development
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandData }
      );
      logger.info(`Successfully reloaded ${commandData.length} guild application (/) commands.`);
    } else {
      // Global commands for production
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandData }
      );
      logger.info(`Successfully reloaded ${commandData.length} global application (/) commands.`);
    }
  } catch (error) {
    logger.error('Error registering commands:', error);
  }
}