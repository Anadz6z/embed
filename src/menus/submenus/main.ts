import { User, ButtonStyle } from "discord.js";
import { creators } from "../../discord/base/base.creators.js";

export function mainMenu(user: User) {
  const embed = creators.createEmbed({
    title: "🏠 Main Menu",
    description: "Welcome to the bot's main menu. Choose an option below to get started.",
    color: 0x0099ff,
    author: {
      name: user.displayName,
      iconURL: user.displayAvatarURL()
    },
    fields: [
      { name: "🎮 Commands", value: "Access all available commands", inline: true },
      { name: "⚙️ Settings", value: "Configure bot settings", inline: true },
      { name: "📊 Analytics", value: "View usage statistics", inline: true },
      { name: "🛡️ Moderation", value: "Moderation tools", inline: true },
      { name: "🎵 Music", value: "Music player controls", inline: true },
      { name: "❓ Help", value: "Get help and support", inline: true }
    ],
    timestamp: new Date()
  });

  const commandsButton = creators.createButton({
    customId: "main:commands",
    label: "Commands",
    style: ButtonStyle.Primary,
    emoji: "🎮"
  });

  const settingsButton = creators.createButton({
    customId: "main:settings",
    label: "Settings",
    style: ButtonStyle.Secondary,
    emoji: "⚙️"
  });

  const analyticsButton = creators.createButton({
    customId: "main:analytics",
    label: "Analytics",
    style: ButtonStyle.Secondary,
    emoji: "📊"
  });

  const moderationButton = creators.createButton({
    customId: "main:moderation",
    label: "Moderation",
    style: ButtonStyle.Secondary,
    emoji: "🛡️"
  });

  const helpButton = creators.createButton({
    customId: "main:help",
    label: "Help",
    style: ButtonStyle.Secondary,
    emoji: "❓"
  });

  const actionRow = creators.createActionRow(commandsButton, settingsButton, analyticsButton, moderationButton, helpButton);

  return {
    embeds: [embed],
    components: [actionRow]
  };
}