import "dotenv/config";
import { createApp } from "./discord/index.js";
import { logger } from "./settings/logger.js";
import { config } from "./settings/config.js";

async function main() {
  let app: any = null;

  try {
    // Load configuration
    await config.load();
    logger.info("Starting Discord bot application...", "Main");

    // Create and start the Discord app
    app = await createApp();

    // Setup graceful shutdown
    setupGracefulShutdown(app);

    logger.info("Discord bot application started successfully!", "Main");

  } catch (error) {
    logger.error("Failed to start Discord bot application", "Main", error);
    process.exit(1);
  }
}

function setupGracefulShutdown(app: any) {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`, "Main");
    
    try {
      if (app?.client) {
        await app.client.destroy();
        logger.info("Discord client destroyed", "Main");
      }
      
      logger.info("Graceful shutdown completed", "Main");
      process.exit(0);
    } catch (error) {
      logger.error("Error during graceful shutdown", "Main", error);
      process.exit(1);
    }
  };

  // Handle different shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', 'Main', error);
    shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', 'Main', { reason, promise });
    shutdown('unhandledRejection');
  });
}

// Start the application
main().catch((error) => {
  logger.error("Fatal error in main function", "Main", error);
  process.exit(1);
});