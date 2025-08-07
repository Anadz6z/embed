// Test setup file for Jest

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DISCORD_TOKEN = 'test_token';
process.env.DISCORD_CLIENT_ID = 'test_client_id';
process.env.DISCORD_GUILD_ID = 'test_guild_id';

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.debug = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
});

// Global test timeout
jest.setTimeout(10000);

// Mock Discord.js
jest.mock('discord.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    login: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    once: jest.fn(),
    channels: {
      cache: new Map()
    },
    guilds: {
      cache: new Map()
    }
  })),
  Collection: jest.fn().mockImplementation(() => new Map()),
  GatewayIntentBits: {
    Guilds: 1,
    GuildMessages: 2,
    MessageContent: 4,
    GuildMembers: 8
  },
  REST: jest.fn().mockImplementation(() => ({
    setToken: jest.fn().mockReturnThis(),
    put: jest.fn().mockResolvedValue(undefined)
  })),
  Routes: {
    applicationCommands: jest.fn().mockReturnValue('/applications/:applicationId/commands'),
    applicationGuildCommands: jest.fn().mockReturnValue('/applications/:applicationId/guilds/:guildId/commands')
  },
  SlashCommandBuilder: jest.fn().mockImplementation(() => ({
    setName: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setDefaultMemberPermissions: jest.fn().mockReturnThis(),
    addStringOption: jest.fn().mockReturnThis(),
    addIntegerOption: jest.fn().mockReturnThis(),
    toJSON: jest.fn().mockReturnValue({ name: 'test', description: 'test' }),
    options: []
  })),
  EmbedBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setColor: jest.fn().mockReturnThis(),
    setAuthor: jest.fn().mockReturnThis(),
    setFooter: jest.fn().mockReturnThis(),
    setThumbnail: jest.fn().mockReturnThis(),
    setImage: jest.fn().mockReturnThis(),
    setTimestamp: jest.fn().mockReturnThis(),
    addFields: jest.fn().mockReturnThis(),
    addField: jest.fn().mockReturnThis()
  })),
  ButtonBuilder: jest.fn().mockImplementation(() => ({
    setCustomId: jest.fn().mockReturnThis(),
    setLabel: jest.fn().mockReturnThis(),
    setStyle: jest.fn().mockReturnThis(),
    setEmoji: jest.fn().mockReturnThis(),
    setURL: jest.fn().mockReturnThis(),
    setDisabled: jest.fn().mockReturnThis()
  })),
  StringSelectMenuBuilder: jest.fn().mockImplementation(() => ({
    setCustomId: jest.fn().mockReturnThis(),
    setPlaceholder: jest.fn().mockReturnThis(),
    setMinValues: jest.fn().mockReturnThis(),
    setMaxValues: jest.fn().mockReturnThis(),
    setDisabled: jest.fn().mockReturnThis(),
    addOptions: jest.fn().mockReturnThis()
  })),
  ActionRowBuilder: jest.fn().mockImplementation(() => ({
    addComponents: jest.fn().mockReturnThis()
  })),
  ButtonStyle: {
    Primary: 1,
    Secondary: 2,
    Success: 3,
    Danger: 4,
    Link: 5
  },
  PermissionFlagsBits: {
    ManageChannels: 1n << 4n,
    SendMessages: 1n << 11n,
    ViewChannel: 1n << 10n
  }
}));

// Mock fs module
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  appendFile: jest.fn(),
  mkdir: jest.fn(),
  access: jest.fn()
}));

// Mock fs module (sync)
jest.mock('fs', () => ({
  readdirSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn((path) => path.split('/').slice(0, -1).join('/'))
}));

// Mock url module
jest.mock('url', () => ({
  fileURLToPath: jest.fn((url) => url.replace('file://', ''))
}));

// Global test utilities
global.testUtils = {
  createMockInteraction: (overrides = {}) => ({
    user: {
      id: 'test_user_id',
      tag: 'test#1234',
      username: 'testuser'
    },
    guild: {
      id: 'test_guild_id',
      name: 'Test Guild',
      channels: {
        create: jest.fn().mockResolvedValue({
          id: 'test_channel_id',
          name: 'test-channel'
        }),
        cache: new Map()
      }
    },
    member: {
      permissions: {
        has: jest.fn().mockReturnValue(true)
      },
      displayName: 'TestUser'
    },
    channel: {
      id: 'test_channel_id',
      name: 'test-channel'
    },
    options: {
      getString: jest.fn(),
      getInteger: jest.fn(),
      getBoolean: jest.fn()
    },
    reply: jest.fn().mockResolvedValue(undefined),
    editReply: jest.fn().mockResolvedValue(undefined),
    followUp: jest.fn().mockResolvedValue(undefined),
    deferReply: jest.fn().mockResolvedValue(undefined),
    replied: false,
    deferred: false,
    ...overrides
  }),

  createMockCommand: (overrides = {}) => ({
    data: {
      name: 'test',
      description: 'Test command',
      toJSON: jest.fn().mockReturnValue({ name: 'test', description: 'Test command' }),
      options: []
    },
    execute: jest.fn().mockResolvedValue(undefined),
    ...overrides
  }),

  createMockResponder: (overrides = {}) => ({
    customId: 'test_responder',
    execute: jest.fn().mockResolvedValue(undefined),
    ...overrides
  })
};

// Type declarations for global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockInteraction: (overrides?: any) => any;
        createMockCommand: (overrides?: any) => any;
        createMockResponder: (overrides?: any) => any;
      };
    }
  }
}