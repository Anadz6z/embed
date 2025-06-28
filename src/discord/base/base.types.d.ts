import { 
  AutocompleteInteraction, 
  ButtonInteraction, 
  ChatInputCommandInteraction, 
  Client, 
  Collection, 
  ModalSubmitInteraction, 
  StringSelectMenuInteraction 
} from "discord.js";

export interface BaseAppData {
  client: Client;
  commands: Collection<string, BaseCommand>;
  responders: Collection<string, BaseResponder>;
}

export interface BaseCommand {
  data: any;
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
  get: (key: string) => any;
  set: (key: string, value: any) => void;
  delete: (key: string) => void;
  has: (key: string) => boolean;
  clear: () => void;
}

export interface BaseCreators {
  createButton: (options: any) => any;
  createSelectMenu: (options: any) => any;
  createModal: (options: any) => any;
  createEmbed: (options: any) => any;
  createActionRow: (...components: any[]) => any;
}