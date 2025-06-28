import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { BaseCommandBuilder } from "../../base/base.command.js";

export default class SettingsCommand extends BaseCommandBuilder {
  data = new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Configure bot settings");

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.safeReply(interaction, {
      content: "Settings menu coming soon!",
      ephemeral: true
    });
  }
}