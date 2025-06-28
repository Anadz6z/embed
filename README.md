# Discord Bot with Advanced Menu System

A powerful Discord bot built with TypeScript featuring an advanced menu system with interactive components.

## Features

- 🎯 **Interactive Menus** - Navigate through complex menu systems with buttons and select menus
- ⚡ **Slash Commands** - Modern Discord slash commands
- 🏗️ **Modular Architecture** - Clean, organized, and scalable code structure
- 🔧 **TypeScript** - Full type safety and modern JavaScript features
- 📱 **Responsive Design** - Menus adapt to different screen sizes and contexts

## Commands

- `/profile` - View and manage user profiles
- `/settings` - Bot configuration and preferences
- `/steps` - Step-by-step guided processes
- `/tabs` - Tabbed interface navigation

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your Discord bot credentials
4. Run in development mode: `npm run dev`
5. Build for production: `npm run build`

## Environment Variables

- `DISCORD_TOKEN` - Your Discord bot token
- `DISCORD_CLIENT_ID` - Your Discord application client ID
- `DISCORD_GUILD_ID` - Your Discord server ID (for development)

## Project Structure

```
src/
├── discord/          # Discord bot core
│   ├── base/         # Base classes and utilities
│   ├── commands/     # Slash commands
│   ├── events/       # Discord event handlers
│   └── responders/   # Interaction responders
├── menus/            # Menu system
│   └── submenus/     # Submenu components
├── functions/        # Utility functions
├── settings/         # Configuration and validation
└── shared/           # Shared utilities and types
```

## License

MIT