import { BaseEventBuilder } from "../../base/base.event.js";

export default class ErrorEvent extends BaseEventBuilder {
  name = "error";

  async execute(error: Error): Promise<void> {
    this.error("Discord client error:", error);
  }
}