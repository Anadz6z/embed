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
import type { 
  BaseCreators, 
  ButtonOptions, 
  SelectMenuOptions, 
  ModalOptions, 
  EmbedOptions 
} from "./base.types.js";

export class BaseCreatorsImpl implements BaseCreators {
  createButton(options: ButtonOptions): ButtonBuilder {
    const button = new ButtonBuilder();
    
    if (options.customId) button.setCustomId(options.customId);
    if (options.label) button.setLabel(options.label);
    if (options.style) button.setStyle(options.style);
    if (options.emoji) button.setEmoji(options.emoji);
    if (options.url) button.setURL(options.url);
    if (options.disabled !== undefined) button.setDisabled(options.disabled);
    
    return button;
  }

  createSelectMenu(options: SelectMenuOptions): StringSelectMenuBuilder {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(options.customId)
      .addOptions(options.options);
    
    if (options.placeholder) selectMenu.setPlaceholder(options.placeholder);
    if (options.minValues !== undefined) selectMenu.setMinValues(options.minValues);
    if (options.maxValues !== undefined) selectMenu.setMaxValues(options.maxValues);
    if (options.disabled !== undefined) selectMenu.setDisabled(options.disabled);
    
    return selectMenu;
  }

  createModal(options: ModalOptions): ModalBuilder {
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

  createEmbed(options: EmbedOptions): EmbedBuilder {
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

  createActionRow(...components: (ButtonBuilder | StringSelectMenuBuilder)[]): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder> {
    return new ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>().addComponents(...components);
  }

  // Utility methods for common patterns
  createSuccessEmbed(title: string, description: string): EmbedBuilder {
    return this.createEmbed({
      title: `✅ ${title}`,
      description,
      color: 0x00ff00,
      timestamp: new Date()
    });
  }

  createErrorEmbed(title: string, description: string): EmbedBuilder {
    return this.createEmbed({
      title: `❌ ${title}`,
      description,
      color: 0xff0000,
      timestamp: new Date()
    });
  }

  createWarningEmbed(title: string, description: string): EmbedBuilder {
    return this.createEmbed({
      title: `⚠️ ${title}`,
      description,
      color: 0xffaa00,
      timestamp: new Date()
    });
  }

  createInfoEmbed(title: string, description: string): EmbedBuilder {
    return this.createEmbed({
      title: `ℹ️ ${title}`,
      description,
      color: 0x0099ff,
      timestamp: new Date()
    });
  }

  createPrimaryButton(customId: string, label: string, emoji?: string): ButtonBuilder {
    return this.createButton({
      customId,
      label,
      style: ButtonStyle.Primary,
      emoji
    });
  }

  createSecondaryButton(customId: string, label: string, emoji?: string): ButtonBuilder {
    return this.createButton({
      customId,
      label,
      style: ButtonStyle.Secondary,
      emoji
    });
  }

  createSuccessButton(customId: string, label: string, emoji?: string): ButtonBuilder {
    return this.createButton({
      customId,
      label,
      style: ButtonStyle.Success,
      emoji
    });
  }

  createDangerButton(customId: string, label: string, emoji?: string): ButtonBuilder {
    return this.createButton({
      customId,
      label,
      style: ButtonStyle.Danger,
      emoji
    });
  }

  createLinkButton(url: string, label: string, emoji?: string): ButtonBuilder {
    return this.createButton({
      url,
      label,
      style: ButtonStyle.Link,
      emoji
    });
  }
}

export const creators = new BaseCreatorsImpl();