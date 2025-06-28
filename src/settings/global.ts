export const GLOBAL_CONFIG = {
  // Bot Configuration
  BOT: {
    NAME: "Discord Menu Bot",
    VERSION: "1.0.0",
    DESCRIPTION: "Advanced Discord bot with interactive menu system",
    PREFIX: "!",
    OWNER_ID: process.env.BOT_OWNER_ID || "",
  },

  // Discord Configuration
  DISCORD: {
    MAX_EMBED_FIELDS: 25,
    MAX_EMBED_DESCRIPTION_LENGTH: 4096,
    MAX_EMBED_TITLE_LENGTH: 256,
    MAX_BUTTON_LABEL_LENGTH: 80,
    MAX_SELECT_MENU_OPTIONS: 25,
    MAX_COMPONENTS_PER_ROW: 5,
    MAX_ROWS_PER_MESSAGE: 5,
  },

  // Colors
  COLORS: {
    PRIMARY: 0x0099ff,
    SUCCESS: 0x00ff00,
    WARNING: 0xffff00,
    ERROR: 0xff0000,
    INFO: 0x00ffff,
    SECONDARY: 0x6c757d,
  },

  // Emojis
  EMOJIS: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    LOADING: "⏳",
    ARROW_LEFT: "⬅️",
    ARROW_RIGHT: "➡️",
    ARROW_UP: "⬆️",
    ARROW_DOWN: "⬇️",
    HOME: "🏠",
    SETTINGS: "⚙️",
    HELP: "❓",
    PROFILE: "👤",
    REFRESH: "🔄",
  },

  // Timeouts (in milliseconds)
  TIMEOUTS: {
    INTERACTION: 15 * 60 * 1000, // 15 minutes
    MENU: 10 * 60 * 1000, // 10 minutes
    BUTTON: 5 * 60 * 1000, // 5 minutes
    MODAL: 15 * 60 * 1000, // 15 minutes
  },

  // Limits
  LIMITS: {
    MAX_MENU_DEPTH: 5,
    MAX_HISTORY_SIZE: 10,
    MAX_CACHE_SIZE: 1000,
    MAX_LOG_ENTRIES: 100,
  },

  // Features
  FEATURES: {
    ENABLE_LOGGING: true,
    ENABLE_ANALYTICS: true,
    ENABLE_CACHING: true,
    ENABLE_RATE_LIMITING: true,
    ENABLE_AUTO_CLEANUP: true,
  },
} as const;

export type GlobalConfig = typeof GLOBAL_CONFIG;