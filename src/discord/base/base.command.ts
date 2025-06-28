import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import type { BaseCommand } from "./base.types.js";

export abstract class BaseCommandBuilder implements BaseCommand {
  public abstract data: SlashCommandBuilder;
  
  public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
  
  public async autocomplete?(interaction: AutocompleteInteraction): Promise<void> {
    // Default implementation - can be overridden
  }

  protected async handleError(interaction: ChatInputCommandInteraction, error: any): Promise<void> {
    console.error('Command error:', error);
    
    const errorMessage = 'There was an error while executing this command!';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }

  protected async safeReply(interaction: ChatInputCommandInteraction, options: any): Promise<void> {
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(options);
      } else {
        await interaction.reply(options);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  }

  protected async safeEdit(interaction: ChatInputCommandInteraction, options: any): Promise<void> {
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(options);
      } else {
        await interaction.reply(options);
      }
    } catch (error) {
      console.error('Error editing reply:', error);
    }
  }

  protected async safeDefer(interaction: ChatInputCommandInteraction, ephemeral: boolean = false): Promise<void> {
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.deferReply({ ephemeral });
      }
    } catch (error) {
      console.error('Error deferring reply:', error);
    }
  }

  protected getUser(interaction: ChatInputCommandInteraction) {
    return interaction.user;
  }

  protected getGuild(interaction: ChatInputCommandInteraction) {
    return interaction.guild;
  }

  protected getChannel(interaction: ChatInputCommandInteraction) {
    return interaction.channel;
  }

  protected getMember(interaction: ChatInputCommandInteraction) {
    return interaction.member;
  }

  protected getOptions(interaction: ChatInputCommandInteraction) {
    return interaction.options;
  }

  protected async checkPermissions(interaction: ChatInputCommandInteraction, permissions: bigint[]): Promise<boolean> {
    if (!interaction.guild || !interaction.member) return false;
    
    const member = interaction.member as any;
    if (!member.permissions) return false;
    
    return permissions.every(permission => member.permissions.has(permission));
  }
}