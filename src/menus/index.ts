export * from "./profile.js";
export * from "./steps.js";
export * from "./tabs.js";
export * from "./submenus/index.js";

import { User } from "discord.js";
import { creators } from "../discord/base/base.creators.js";

export function createBaseMenu(user: User, title: string, description: string) {
  const embed = creators.createEmbed({
    title,
    description,
    color: 0x0099ff,
    author: {
      name: user.displayName,
      iconURL: user.displayAvatarURL()
    },
    timestamp: new Date()
  });

  return { embeds: [embed] };
}