import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { BaseCommandBuilder } from "../../base/base.command.js";

export default class TabsCommand extends BaseCommandBuilder {
  data = new SlashCommandBuilder()
    .setName("tabs")
    .setDescription("Tabbed interface navigation");

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.safeReply(interaction, {
      content: "Tabs menu coming soon!",
      ephemeral: true
    });
  }
}