import { 
  AutocompleteInteraction, 
  ButtonInteraction, 
  ChatInputCommandInteraction, 
  Client, 
  Collection, 
  ModalSubmitInteraction, 
  StringSelectMenuInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  ButtonStyle,
  TextInputStyle,
  PermissionResolvable,
  GuildMember,
  User,
  Guild,
  Channel,
  GuildBasedChannel
} from "discord.js";

export interface BaseAppData {
  client: Client;
  commands: Collection<string, BaseCommand>;
  responders: Collection<string, BaseResponder>;
}

export interface BaseCommand {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface BaseResponder {
  customId: string;
  execute: (
    interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction
  ) => Promise<void>;
}

export interface BaseEvent {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => Promise<void>;
}

export interface BaseStorage {
  get: <T = any>(key: string) => T | undefined;
  set: <T = any>(key: string, value: T) => void;
  delete: (key: string) => boolean;
  has: (key: string) => boolean;
  clear: () => void;
}

export interface ButtonOptions {
  customId?: string;
  label?: string;
  style?: ButtonStyle;
  emoji?: string;
  url?: string;
  disabled?: boolean;
}

export interface SelectMenuOptions {
  customId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  options: Array<{
    label: string;
    value: string;
    description?: string;
    emoji?: string;
    default?: boolean;
  }>;
}

export interface ModalOptions {
  customId: string;
  title: string;
  components: Array<{
    customId: string;
    label: string;
    style?: TextInputStyle;
    placeholder?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    value?: string;
  }>;
}

export interface EmbedOptions {
  title?: string;
  description?: string;
  color?: number;
  author?: { name: string; iconURL?: string; url?: string };
  footer?: { text: string; iconURL?: string };
  thumbnail?: string;
  image?: string;
  timestamp?: Date | number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

export interface BaseCreators {
  createButton: (options: ButtonOptions) => ButtonBuilder;
  createSelectMenu: (options: SelectMenuOptions) => StringSelectMenuBuilder;
  createModal: (options: ModalOptions) => ModalBuilder;
  createEmbed: (options: EmbedOptions) => EmbedBuilder;
  createActionRow: (...components: (ButtonBuilder | StringSelectMenuBuilder)[]) => ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>;
}

export interface InteractionContext {
  user: User;
  member?: GuildMember;
  guild?: Guild;
  channel?: GuildBasedChannel;
  permissions?: PermissionResolvable[];
}

export interface CommandContext extends InteractionContext {
  options: ChatInputCommandInteraction['options'];
}

export interface ResponderContext extends InteractionContext {
  customId: string;
  componentType: 'button' | 'select' | 'modal';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CommandValidation {
  permissions: ValidationResult;
  cooldown: ValidationResult;
  usage: ValidationResult;
}

export interface CooldownEntry {
  userId: string;
  commandName: string;
  timestamp: number;
  expiresAt: number;
}

export interface CommandStats {
  name: string;
  usageCount: number;
  lastUsed: Date;
  averageResponseTime: number;
  errorCount: number;
  successRate: number;
}