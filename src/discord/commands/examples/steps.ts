import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { BaseCommandBuilder } from "../../base/base.command.js";

export default class StepsCommand extends BaseCommandBuilder {
  data = new SlashCommandBuilder()
    .setName("steps")
    .setDescription("Step-by-step guided process");

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.safeReply(interaction, {
      content: "Steps menu coming soon!",
      ephemeral: true
    });
  }
}