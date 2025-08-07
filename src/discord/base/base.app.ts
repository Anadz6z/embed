import { Client, Collection, GatewayIntentBits, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { BaseAppData, BaseCommand, BaseResponder, BaseEvent } from "./base.types.js";
import { config } from "../../settings/config.js";
import { logger } from "../../settings/logger.js";
import { AppError, DiscordAPIError } from "../../settings/error.js";
import { Cache } from "../../shared/cache.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function createApp(): Promise<BaseAppData> {
  const startTime = performance.now();
  
  try {
    // Load configuration
    await config.load();
    const discordConfig = config.getDiscord();
    
    logger.info("Starting Discord bot...", "App");

    const client = new Client({
      intents: discordConfig.intents.map(intent => GatewayIntentBits[intent as keyof typeof GatewayIntentBits])
    });

    const commands = new Collection<string, BaseCommand>();
    const responders = new Collection<string, BaseResponder>();

    // Load components with performance monitoring
    await logger.time("Loading commands", () => loadCommands(commands));
    await logger.time("Loading responders", () => loadResponders(responders));
    await logger.time("Loading events", () => loadEvents(client));

    // Register slash commands
    await logger.time("Registering commands", () => 
      registerCommands(commands, discordConfig.token, discordConfig.clientId, discordConfig.guildId)
    );

    // Store collections in client for access in events
    (client as any).commands = commands;
    (client as any).responders = responders;

    // Login to Discord
    await logger.time("Discord login", () => client.login(discordConfig.token));

    const duration = performance.now() - startTime;
    logger.info(`Discord bot started successfully in ${duration.toFixed(2)}ms!`, "App");

    return { client, commands, responders };
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`Failed to start Discord bot after ${duration.toFixed(2)}ms`, "App", error);
    throw error;
  }
}

async function loadCommands(commands: Collection<string, BaseCommand>) {
  const commandsPath = join(__dirname, "../commands");
  
  try {
    const commandFolders = readdirSync(commandsPath, { withFileTypes: true });

    for (const folder of commandFolders) {
      if (folder.isDirectory()) {
        await loadCommandsFromFolder(commands, join(commandsPath, folder.name), folder.name);
      } else if (folder.name.endsWith('.js') || folder.name.endsWith('.ts')) {
        await loadCommandFromFile(commands, join(commandsPath, folder.name));
      }
    }

    logger.info(`Loaded ${commands.size} commands`, "Commands");
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      logger.warn("Commands directory not found, skipping command loading", "Commands");
    } else {
      throw new AppError("Failed to load commands", {
        code: "COMMAND_LOAD_ERROR",
        cause: error instanceof Error ? error : undefined
      });
    }
  }
}

async function loadCommandsFromFolder(
  commands: Collection<string, BaseCommand>, 
  folderPath: string, 
  folderName: string
) {
  try {
    const commandFiles = readdirSync(folderPath).filter(file => 
      file.endsWith('.js') || file.endsWith('.ts')
    );
    
    for (const file of commandFiles) {
      await loadCommandFromFile(commands, join(folderPath, file));
    }
  } catch (error) {
    logger.error(`Failed to load commands from folder: ${folderName}`, "Commands", error);
  }
}

async function loadCommandFromFile(commands: Collection<string, BaseCommand>, filePath: string) {
  try {
    const command = await import(filePath);
    
    if ('data' in command.default && 'execute' in command.default) {
      const commandInstance = command.default;
      
      // Validate command structure
      if (!commandInstance.data.name) {
        logger.warn(`Command missing name: ${filePath}`, "Commands");
        return;
      }

      commands.set(commandInstance.data.name, commandInstance);
      logger.debug(`Loaded command: ${commandInstance.data.name}`, "Commands");
    } else {
      logger.warn(`Invalid command structure in: ${filePath}`, "Commands");
    }
  } catch (error) {
    logger.error(`Failed to load command from: ${filePath}`, "Commands", error);
  }
}

async function loadResponders(responders: Collection<string, BaseResponder>) {
  const respondersPath = join(__dirname, "../responders");
  
  try {
    const responderFiles = readdirSync(respondersPath).filter(file => 
      file.endsWith('.js') || file.endsWith('.ts')
    );

    for (const file of responderFiles) {
      await loadResponderFromFile(responders, join(respondersPath, file));
    }

    logger.info(`Loaded ${responders.size} responders`, "Responders");
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      logger.warn("Responders directory not found, skipping responder loading", "Responders");
    } else {
      throw new AppError("Failed to load responders", {
        code: "RESPONDER_LOAD_ERROR",
        cause: error instanceof Error ? error : undefined
      });
    }
  }
}

async function loadResponderFromFile(responders: Collection<string, BaseResponder>, filePath: string) {
  try {
    const responder = await import(filePath);
    
    if ('customId' in responder.default && 'execute' in responder.default) {
      const responderInstance = responder.default;
      
      // Validate responder structure
      if (!responderInstance.customId) {
        logger.warn(`Responder missing customId: ${filePath}`, "Responders");
        return;
      }

      responders.set(responderInstance.customId, responderInstance);
      logger.debug(`Loaded responder: ${responderInstance.customId}`, "Responders");
    } else {
      logger.warn(`Invalid responder structure in: ${filePath}`, "Responders");
    }
  } catch (error) {
    logger.error(`Failed to load responder from: ${filePath}`, "Responders", error);
  }
}

async function loadEvents(client: Client) {
  const eventsPath = join(__dirname, "../events");
  
  try {
    const eventFolders = readdirSync(eventsPath, { withFileTypes: true });

    for (const folder of eventFolders) {
      if (folder.isDirectory()) {
        await loadEventsFromFolder(client, join(eventsPath, folder.name), folder.name);
      }
    }

    logger.info("Events loaded successfully", "Events");
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      logger.warn("Events directory not found, skipping event loading", "Events");
    } else {
      throw new AppError("Failed to load events", {
        code: "EVENT_LOAD_ERROR",
        cause: error instanceof Error ? error : undefined
      });
    }
  }
}

async function loadEventsFromFolder(client: Client, folderPath: string, folderName: string) {
  try {
    const eventFiles = readdirSync(folderPath).filter(file => 
      file.endsWith('.js') || file.endsWith('.ts')
    );
    
    for (const file of eventFiles) {
      await loadEventFromFile(client, join(folderPath, file));
    }
  } catch (error) {
    logger.error(`Failed to load events from folder: ${folderName}`, "Events", error);
  }
}

async function loadEventFromFile(client: Client, filePath: string) {
  try {
    const event = await import(filePath);
    
    if ('name' in event.default && 'execute' in event.default) {
      const eventInstance = event.default;
      
      // Validate event structure
      if (!eventInstance.name) {
        logger.warn(`Event missing name: ${filePath}`, "Events");
        return;
      }

      if (eventInstance.once) {
        client.once(eventInstance.name, (...args) => eventInstance.execute(...args));
      } else {
        client.on(eventInstance.name, (...args) => eventInstance.execute(...args));
      }
      
      logger.debug(`Loaded event: ${eventInstance.name}`, "Events");
    } else {
      logger.warn(`Invalid event structure in: ${filePath}`, "Events");
    }
  } catch (error) {
    logger.error(`Failed to load event from: ${filePath}`, "Events", error);
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
    logger.info(`Started refreshing ${commandData.length} application (/) commands.`, "Commands");

    if (guildId) {
      // Guild-specific commands for development
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commandData }
      );
      logger.info(`Successfully reloaded ${commandData.length} guild application (/) commands.`, "Commands");
    } else {
      // Global commands for production
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commandData }
      );
      logger.info(`Successfully reloaded ${commandData.length} global application (/) commands.`, "Commands");
    }
  } catch (error) {
    throw new DiscordAPIError("Error registering commands", {
      details: { commandCount: commandData.length, guildId }
    });
  }
}