import { User, ButtonStyle } from "discord.js";
import { creators } from "../discord/base/base.creators.js";

export function profileMenu(user: User) {
  const embed = creators.createEmbed({
    title: "👤 User Profile",
    description: `Profile information for ${user.displayName}`,
    color: 0x0099ff,
    author: {
      name: user.displayName,
      iconURL: user.displayAvatarURL()
    },
    fields: [
      { name: "Username", value: user.username, inline: true },
      { name: "Display Name", value: user.displayName, inline: true },
      { name: "User ID", value: user.id, inline: true },
      { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
      { name: "Avatar", value: user.displayAvatarURL() ? "✅ Has Avatar" : "❌ No Avatar", inline: true },
      { name: "Bot Account", value: user.bot ? "✅ Yes" : "❌ No", inline: true }
    ],
    thumbnail: user.displayAvatarURL(),
    timestamp: new Date()
  });

  const refreshButton = creators.createButton({
    customId: "profile:refresh",
    label: "Refresh",
    style: ButtonStyle.Primary,
    emoji: "🔄"
  });

  const editButton = creators.createButton({
    customId: "profile:edit",
    label: "Edit Profile",
    style: ButtonStyle.Secondary,
    emoji: "✏️"
  });

  const settingsButton = creators.createButton({
    customId: "profile:settings",
    label: "Settings",
    style: ButtonStyle.Secondary,
    emoji: "⚙️"
  });

  const actionRow = creators.createActionRow(refreshButton, editButton, settingsButton);

  const selectMenu = creators.createSelectMenu({
    customId: "profile:options",
    placeholder: "Choose an option...",
    options: [
      {
        label: "View Full Profile",
        value: "full_profile",
        description: "View detailed profile information",
        emoji: "👤"
      },
      {
        label: "Privacy Settings",
        value: "privacy",
        description: "Manage your privacy settings",
        emoji: "🔒"
      },
      {
        label: "Notification Settings",
        value: "notifications",
        description: "Configure notification preferences",
        emoji: "🔔"
      },
      {
        label: "Account Security",
        value: "security",
        description: "Security and authentication settings",
        emoji: "🛡️"
      }
    ]
  });

  const selectRow = creators.createActionRow(selectMenu);

  return {
    embeds: [embed],
    components: [actionRow, selectRow]
  };
}