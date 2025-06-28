import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { BaseCommandBuilder } from "../base/base.command.js";
import { creators } from "../base/base.creators.js";

export default class SeparatorsCommand extends BaseCommandBuilder {
  data = new SlashCommandBuilder()
    .setName("separators")
    .setDescription("Create channel separators")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(option =>
      option.setName("name")
        .setDescription("Name of the separator")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("style")
        .setDescription("Style of the separator")
        .setRequired(false)
        .addChoices(
          { name: "Simple", value: "simple" },
          { name: "Decorated", value: "decorated" },
          { name: "Minimal", value: "minimal" }
        )
    );

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const name = interaction.options.getString("name", true);
      const style = interaction.options.getString("style") || "simple";

      if (!interaction.guild) {
        await this.safeReply(interaction, {
          content: "This command can only be used in a server!",
          ephemeral: true
        });
        return;
      }

      // Check permissions
      if (!await this.checkPermissions(interaction, [PermissionFlagsBits.ManageChannels])) {
        await this.safeReply(interaction, {
          content: "You don't have permission to manage channels!",
          ephemeral: true
        });
        return;
      }

      await this.safeDefer(interaction);

      let separatorName: string;
      switch (style) {
        case "decorated":
          separatorName = `╭─────── ${name.toUpperCase()} ───────╮`;
          break;
        case "minimal":
          separatorName = `── ${name} ──`;
          break;
        default:
          separatorName = `━━━ ${name.toUpperCase()} ━━━`;
      }

      const channel = await interaction.guild.channels.create({
        name: separatorName,
        type: 4, // Category channel
        position: 0
      });

      const embed = creators.createEmbed({
        title: "✅ Separator Created",
        description: `Successfully created separator: **${separatorName}**`,
        color: 0x00ff00,
        fields: [
          { name: "Style", value: style, inline: true },
          { name: "Channel ID", value: channel.id, inline: true }
        ],
        timestamp: new Date()
      });

      await this.safeEdit(interaction, { embeds: [embed] });

    } catch (error) {
      await this.handleError(interaction, error);
    }
  }
}