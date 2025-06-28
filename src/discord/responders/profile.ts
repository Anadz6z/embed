import { ButtonInteraction, StringSelectMenuInteraction, ModalSubmitInteraction } from "discord.js";
import { BaseResponderBuilder } from "../base/base.responder.js";
import { profileMenu } from "../../menus/profile.js";

export default class ProfileResponder extends BaseResponderBuilder {
  customId = "profile";

  async execute(
    interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction
  ): Promise<void> {
    try {
      if (this.isButton(interaction)) {
        await this.handleButtonInteraction(interaction);
      } else if (this.isSelectMenu(interaction)) {
        await this.handleSelectMenuInteraction(interaction);
      } else if (this.isModal(interaction)) {
        await this.handleModalInteraction(interaction);
      }
    } catch (error) {
      await this.handleError(interaction, error);
    }
  }

  private async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    const [, action] = interaction.customId.split(":");
    
    switch (action) {
      case "refresh":
        const menu = profileMenu(interaction.user);
        await this.safeUpdate(interaction, menu);
        break;
      case "edit":
        await this.safeReply(interaction, {
          content: "Profile editing coming soon!",
          ephemeral: true
        });
        break;
      default:
        await this.safeReply(interaction, {
          content: "Unknown action!",
          ephemeral: true
        });
    }
  }

  private async handleSelectMenuInteraction(interaction: StringSelectMenuInteraction): Promise<void> {
    const selectedValue = interaction.values[0];
    
    await this.safeReply(interaction, {
      content: `You selected: ${selectedValue}`,
      ephemeral: true
    });
  }

  private async handleModalInteraction(interaction: ModalSubmitInteraction): Promise<void> {
    await this.safeReply(interaction, {
      content: "Modal submitted successfully!",
      ephemeral: true
    });
  }
}