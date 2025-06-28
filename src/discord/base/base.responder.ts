import { 
  ButtonInteraction, 
  StringSelectMenuInteraction, 
  ModalSubmitInteraction,
  InteractionResponse,
  Message
} from "discord.js";
import type { BaseResponder } from "./base.types.js";

export abstract class BaseResponderBuilder implements BaseResponder {
  public abstract customId: string;
  
  public abstract execute(
    interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction
  ): Promise<void>;

  protected async handleError(
    interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction, 
    error: any
  ): Promise<void> {
    console.error('Responder error:', error);
    
    const errorMessage = 'There was an error while processing this interaction!';
    
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (replyError) {
      console.error('Error sending error message:', replyError);
    }
  }

  protected async safeReply(
    interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction,
    options: any
  ): Promise<InteractionResponse | Message | void> {
    try {
      if (interaction.replied || interaction.deferred) {
        return await interaction.followUp(options);
      } else {
        return await interaction.reply(options);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  }

  protected async safeEdit(
    interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction,
    options: any
  ): Promise<InteractionResponse | Message | void> {
    try {
      if (interaction.deferred || interaction.replied) {
        return await interaction.editReply(options);
      } else {
        return await interaction.reply(options);
      }
    } catch (error) {
      console.error('Error editing reply:', error);
    }
  }

  protected async safeDefer(
    interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction,
    ephemeral: boolean = false
  ): Promise<void> {
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.deferReply({ ephemeral });
      }
    } catch (error) {
      console.error('Error deferring reply:', error);
    }
  }

  protected async safeUpdate(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
    options: any
  ): Promise<InteractionResponse | void> {
    try {
      if (interaction.isButton() || interaction.isStringSelectMenu()) {
        return await interaction.update(options);
      }
    } catch (error) {
      console.error('Error updating interaction:', error);
    }
  }

  protected getUser(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction) {
    return interaction.user;
  }

  protected getGuild(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction) {
    return interaction.guild;
  }

  protected getChannel(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction) {
    return interaction.channel;
  }

  protected getMember(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction) {
    return interaction.member;
  }

  protected isButton(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction): interaction is ButtonInteraction {
    return interaction.isButton();
  }

  protected isSelectMenu(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction): interaction is StringSelectMenuInteraction {
    return interaction.isStringSelectMenu();
  }

  protected isModal(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction): interaction is ModalSubmitInteraction {
    return interaction.isModalSubmit();
  }
}