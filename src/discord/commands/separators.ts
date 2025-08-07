import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { BaseCommandBuilder } from "../base/base.command.js";
import { creators } from "../base/base.creators.js";
import { ValidationError } from "../../settings/error.js";

export default class SeparatorsCommand extends BaseCommandBuilder {
  data = new SlashCommandBuilder()
    .setName("separators")
    .setDescription("Create channel separators")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(option =>
      option.setName("name")
        .setDescription("Name of the separator")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(50)
    )
    .addStringOption(option =>
      option.setName("style")
        .setDescription("Style of the separator")
        .setRequired(false)
        .addChoices(
          { name: "Simple", value: "simple" },
          { name: "Decorated", value: "decorated" },
          { name: "Minimal", value: "minimal" },
          { name: "Bold", value: "bold" },
          { name: "Fancy", value: "fancy" }
        )
    )
    .addIntegerOption(option =>
      option.setName("position")
        .setDescription("Position of the separator (0 = top)")
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(100)
    );

  protected getRequiredPermissions(): bigint[] {
    return [PermissionFlagsBits.ManageChannels];
  }

  protected getCooldown(): number {
    return 30; // 30 seconds cooldown
  }

  protected async customValidation(interaction: ChatInputCommandInteraction) {
    const errors: string[] = [];
    const warnings: string[] = [];

    const name = interaction.options.getString("name", true);
    
    // Validate separator name
    if (name.length < 1) {
      errors.push("O nome do separador deve ter pelo menos 1 caractere.");
    }
    
    if (name.length > 50) {
      errors.push("O nome do separador deve ter no máximo 50 caracteres.");
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(name)) {
      errors.push("O nome do separador contém caracteres inválidos.");
    }

    // Check if separator already exists
    if (interaction.guild) {
      const existingChannels = interaction.guild.channels.cache.filter(channel => 
        channel.name.includes(name) && channel.type === 4 // Category channel
      );
      
      if (existingChannels.size > 0) {
        warnings.push("Já existem separadores com nomes similares.");
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const startTime = performance.now();
    let success = false;

    try {
      // Validate permissions and requirements
      await this.requireGuild(interaction);
      await this.requirePermissions(interaction, this.getRequiredPermissions());

      const validation = await this.validateUsage(interaction);
      if (!validation.isValid) {
        const embed = creators.createErrorEmbed(
          "Validação Falhou",
          validation.errors.join('\n')
        );
        await this.safeReply(interaction, { embeds: [embed], ephemeral: true });
        return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        const warningEmbed = creators.createWarningEmbed(
          "Avisos",
          validation.warnings.join('\n')
        );
        await this.safeReply(interaction, { embeds: [warningEmbed], ephemeral: true });
      }

      await this.safeDefer(interaction);

      const name = interaction.options.getString("name", true);
      const style = interaction.options.getString("style") || "simple";
      const position = interaction.options.getInteger("position") || 0;

      const separatorName = this.generateSeparatorName(name, style);
      const guild = interaction.guild!;

      // Create the separator channel
      const channel = await guild.channels.create({
        name: separatorName,
        type: 4, // Category channel
        position: position,
        reason: `Separator created by ${interaction.user.tag}`
      });

      // Create success embed
      const embed = creators.createSuccessEmbed(
        "Separador Criado",
        `Separador **${separatorName}** criado com sucesso!`
      );

      embed.addFields([
        { name: "Estilo", value: style, inline: true },
        { name: "Posição", value: position.toString(), inline: true },
        { name: "ID do Canal", value: channel.id, inline: true },
        { name: "Criado por", value: interaction.user.tag, inline: true }
      ]);

      await this.safeEdit(interaction, { embeds: [embed] });
      success = true;

    } catch (error) {
      await this.handleError(interaction, error);
    } finally {
      const duration = performance.now() - startTime;
      await this.logCommandUsage(interaction, success, duration);
    }
  }

  private generateSeparatorName(name: string, style: string): string {
    const cleanName = name.trim();
    
    switch (style) {
      case "decorated":
        return `╭─────── ${cleanName.toUpperCase()} ───────╮`;
      case "minimal":
        return `── ${cleanName} ──`;
      case "bold":
        return `━━━ ${cleanName.toUpperCase()} ━━━`;
      case "fancy":
        return `✦ ${cleanName.toUpperCase()} ✦`;
      case "simple":
      default:
        return `━━━ ${cleanName.toUpperCase()} ━━━`;
    }
  }
}