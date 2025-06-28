import { 
  ActionRowBuilder, 
  ButtonBuilder, 
  StringSelectMenuBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  EmbedBuilder,
  ButtonStyle,
  TextInputStyle
} from "discord.js";
import type { BaseCreators } from "./base.types.js";

export class BaseCreatorsImpl implements BaseCreators {
  createButton(options: {
    customId?: string;
    label?: string;
    style?: ButtonStyle;
    emoji?: string;
    url?: string;
    disabled?: boolean;
  }) {
    const button = new ButtonBuilder();
    
    if (options.customId) button.setCustomId(options.customId);
    if (options.label) button.setLabel(options.label);
    if (options.style) button.setStyle(options.style);
    if (options.emoji) button.setEmoji(options.emoji);
    if (options.url) button.setURL(options.url);
    if (options.disabled !== undefined) button.setDisabled(options.disabled);
    
    return button;
  }

  createSelectMenu(options: {
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
  }) {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(options.customId)
      .addOptions(options.options);
    
    if (options.placeholder) selectMenu.setPlaceholder(options.placeholder);
    if (options.minValues !== undefined) selectMenu.setMinValues(options.minValues);
    if (options.maxValues !== undefined) selectMenu.setMaxValues(options.maxValues);
    if (options.disabled !== undefined) selectMenu.setDisabled(options.disabled);
    
    return selectMenu;
  }

  createModal(options: {
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
  }) {
    const modal = new ModalBuilder()
      .setCustomId(options.customId)
      .setTitle(options.title);

    const actionRows = options.components.map(component => {
      const textInput = new TextInputBuilder()
        .setCustomId(component.customId)
        .setLabel(component.label)
        .setStyle(component.style || TextInputStyle.Short);

      if (component.placeholder) textInput.setPlaceholder(component.placeholder);
      if (component.required !== undefined) textInput.setRequired(component.required);
      if (component.minLength !== undefined) textInput.setMinLength(component.minLength);
      if (component.maxLength !== undefined) textInput.setMaxLength(component.maxLength);
      if (component.value) textInput.setValue(component.value);

      return new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
    });

    modal.addComponents(...actionRows);
    return modal;
  }

  createEmbed(options: {
    title?: string;
    description?: string;
    color?: number;
    author?: { name: string; iconURL?: string; url?: string };
    footer?: { text: string; iconURL?: string };
    thumbnail?: string;
    image?: string;
    timestamp?: Date | number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  }) {
    const embed = new EmbedBuilder();
    
    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.color) embed.setColor(options.color);
    if (options.author) embed.setAuthor(options.author);
    if (options.footer) embed.setFooter(options.footer);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);
    if (options.timestamp) embed.setTimestamp(options.timestamp);
    if (options.fields) embed.addFields(options.fields);
    
    return embed;
  }

  createActionRow(...components: any[]) {
    return new ActionRowBuilder().addComponents(...components);
  }
}

export const creators = new BaseCreatorsImpl();