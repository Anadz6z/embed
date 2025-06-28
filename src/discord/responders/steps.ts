import { ButtonInteraction, StringSelectMenuInteraction, ModalSubmitInteraction } from "discord.js";
import { BaseResponderBuilder } from "../base/base.responder.js";

export default class StepsResponder extends BaseResponderBuilder {
  customId = "steps";

  async execute(
    interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction
  ): Promise<void> {
    try {
      await this.safeReply(interaction, {
        content: "Steps interaction handled!",
        ephemeral: true
      });
    } catch (error) {
      await this.handleError(interaction, error);
    }
  }
}