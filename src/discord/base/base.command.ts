import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  AutocompleteInteraction,
  PermissionFlagsBits,
  GuildMember,
  EmbedBuilder
} from "discord.js";
import type { BaseCommand, CommandContext, ValidationResult } from "./base.types.js";
import { logger } from "../../settings/logger.js";
import { AppError, PermissionError, ValidationError } from "../../settings/error.js";
import { creators } from "./base.creators.js";
import { Cache } from "../../shared/cache.js";

export abstract class BaseCommandBuilder implements BaseCommand {
  public abstract data: SlashCommandBuilder;
  
  // Cooldown cache (5 minutes default)
  private static cooldownCache = new Cache<Map<string, number>>("command_cooldowns", { ttl: 300 });
  
  // Command statistics
  private static statsCache = new Cache<Map<string, any>>("command_stats", { ttl: 3600 });
  
  public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
  
  public async autocomplete?(interaction: AutocompleteInteraction): Promise<void> {
    // Default implementation - can be overridden
  }

  protected async handleError(interaction: ChatInputCommandInteraction, error: unknown): Promise<void> {
    const appError = error instanceof AppError ? error : new AppError(
      error instanceof Error ? error.message : 'An unknown error occurred',
      { code: 'COMMAND_ERROR', cause: error instanceof Error ? error : undefined }
    );

    logger.error(
      `Command error: ${this.data.name}`,
      'Command',
      appError,
      {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
      }
    );

    const errorMessage = this.getErrorMessage(appError);
    
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: errorMessage, 
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: errorMessage, 
          ephemeral: true 
        });
      }
    } catch (replyError) {
      logger.error('Failed to send error reply', 'Command', replyError);
    }
  }

  private getErrorMessage(error: AppError): string {
    switch (error.code) {
      case 'PERMISSION_ERROR':
        return '❌ Você não tem permissão para usar este comando.';
      case 'VALIDATION_ERROR':
        return '❌ Dados inválidos fornecidos.';
      case 'COOLDOWN_ERROR':
        return '⏰ Aguarde um pouco antes de usar este comando novamente.';
      default:
        return '❌ Ocorreu um erro ao executar este comando.';
    }
  }

  protected async safeReply(
    interaction: ChatInputCommandInteraction, 
    options: { content?: string; embeds?: EmbedBuilder[]; ephemeral?: boolean }
  ): Promise<void> {
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(options);
      } else {
        await interaction.reply(options);
      }
    } catch (error) {
      logger.error('Error sending reply', 'Command', error);
      throw error;
    }
  }

  protected async safeEdit(
    interaction: ChatInputCommandInteraction, 
    options: { content?: string; embeds?: EmbedBuilder[] }
  ): Promise<void> {
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(options);
      } else {
        await interaction.reply(options);
      }
    } catch (error) {
      logger.error('Error editing reply', 'Command', error);
      throw error;
    }
  }

  protected async safeDefer(interaction: ChatInputCommandInteraction, ephemeral: boolean = false): Promise<void> {
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.deferReply({ ephemeral });
      }
    } catch (error) {
      logger.error('Error deferring reply', 'Command', error);
      throw error;
    }
  }

  protected getContext(interaction: ChatInputCommandInteraction): CommandContext {
    return {
      user: interaction.user,
      member: interaction.member as GuildMember | undefined,
      guild: interaction.guild || undefined,
      channel: interaction.channel || undefined,
      options: interaction.options,
    };
  }

  protected async validatePermissions(interaction: ChatInputCommandInteraction): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!interaction.guild) {
      errors.push('Este comando só pode ser usado em servidores.');
      return { isValid: false, errors, warnings };
    }

    if (!interaction.member) {
      errors.push('Informações do membro não disponíveis.');
      return { isValid: false, errors, warnings };
    }

    const member = interaction.member as GuildMember;
    const requiredPermissions = this.getRequiredPermissions();

    if (requiredPermissions.length > 0) {
      const missingPermissions = requiredPermissions.filter(
        permission => !member.permissions.has(permission)
      );

      if (missingPermissions.length > 0) {
        errors.push(`Permissões necessárias: ${missingPermissions.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  protected async validateCooldown(interaction: ChatInputCommandInteraction): Promise<ValidationResult> {
    const cooldown = this.getCooldown();
    if (cooldown <= 0) {
      return { isValid: true, errors: [], warnings: [] };
    }

    const userId = interaction.user.id;
    const commandName = this.data.name;
    const cacheKey = `${commandName}:${userId}`;

    const cooldowns = await BaseCommandBuilder.cooldownCache.getOrSet(
      commandName,
      () => new Map<string, number>(),
      300 // 5 minutes cache
    );

    const lastUsed = cooldowns.get(cacheKey);
    const now = Date.now();

    if (lastUsed && (now - lastUsed) < cooldown * 1000) {
      const remaining = Math.ceil((cooldown * 1000 - (now - lastUsed)) / 1000);
      return {
        isValid: false,
        errors: [`Aguarde ${remaining} segundos antes de usar este comando novamente.`],
        warnings: []
      };
    }

    cooldowns.set(cacheKey, now);
    return { isValid: true, errors: [], warnings: [] };
  }

  protected async validateUsage(interaction: ChatInputCommandInteraction): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required options
    for (const option of this.data.options) {
      if (option.required && !interaction.options.get(option.name)) {
        errors.push(`Opção obrigatória não fornecida: ${option.name}`);
      }
    }

    // Custom validation can be overridden by subclasses
    const customValidation = await this.customValidation(interaction);
    errors.push(...customValidation.errors);
    warnings.push(...customValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  protected async customValidation(interaction: ChatInputCommandInteraction): Promise<ValidationResult> {
    // Override in subclasses for custom validation
    return { isValid: true, errors: [], warnings: [] };
  }

  protected getRequiredPermissions(): bigint[] {
    // Override in subclasses to specify required permissions
    return [];
  }

  protected getCooldown(): number {
    // Override in subclasses to specify cooldown in seconds
    return 0;
  }

  protected async checkPermissions(interaction: ChatInputCommandInteraction, permissions: bigint[]): Promise<boolean> {
    if (!interaction.guild || !interaction.member) return false;
    
    const member = interaction.member as GuildMember;
    return permissions.every(permission => member.permissions.has(permission));
  }

  protected async requirePermissions(interaction: ChatInputCommandInteraction, permissions: bigint[]): Promise<void> {
    if (!await this.checkPermissions(interaction, permissions)) {
      throw new PermissionError(
        `Permissões necessárias: ${permissions.join(', ')}`,
        { permissions }
      );
    }
  }

  protected async requireGuild(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      throw new ValidationError('Este comando só pode ser usado em servidores.');
    }
  }

  protected async logCommandUsage(interaction: ChatInputCommandInteraction, success: boolean, duration: number): Promise<void> {
    const stats = await BaseCommandBuilder.statsCache.getOrSet(
      'command_stats',
      () => new Map<string, any>(),
      3600 // 1 hour cache
    );

    const commandName = this.data.name;
    const currentStats = stats.get(commandName) || {
      usageCount: 0,
      lastUsed: new Date(),
      totalResponseTime: 0,
      errorCount: 0,
    };

    currentStats.usageCount++;
    currentStats.lastUsed = new Date();
    currentStats.totalResponseTime += duration;

    if (!success) {
      currentStats.errorCount++;
    }

    currentStats.averageResponseTime = currentStats.totalResponseTime / currentStats.usageCount;
    currentStats.successRate = ((currentStats.usageCount - currentStats.errorCount) / currentStats.usageCount) * 100;

    stats.set(commandName, currentStats);

    logger.info(
      `Command executed: ${commandName} (${duration.toFixed(2)}ms, success: ${success})`,
      'Command',
      {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        duration,
        success,
      }
    );
  }

  // Utility methods
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
    return interaction.member as GuildMember | undefined;
  }

  protected getOptions(interaction: ChatInputCommandInteraction) {
    return interaction.options;
  }
}