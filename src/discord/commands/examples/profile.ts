import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { BaseCommandBuilder } from "../../base/base.command.js";
import { profileMenu } from "../../../menus/profile.js";

export default class ProfileCommand extends BaseCommandBuilder {
  data = new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View and manage your profile");

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const menu = profileMenu(interaction.user);
      await this.safeReply(interaction, menu);
    } catch (error) {
      await this.handleError(interaction, error);
    }
  }
}