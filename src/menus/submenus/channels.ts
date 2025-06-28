import { User, ButtonStyle, ChannelType } from "discord.js";
import { creators } from "../../discord/base/base.creators.js";

export function channelsMenu(user: User, guildId?: string) {
  const embed = creators.createEmbed({
    title: "📺 Channel Management",
    description: "Manage server channels and categories",
    color: 0x0099ff,
    author: {
      name: user.displayName,
      iconURL: user.displayAvatarURL()
    },
    fields: [
      { name: "Text Channels", value: "Manage text channels", inline: true },
      { name: "Voice Channels", value: "Manage voice channels", inline: true },
      { name: "Categories", value: "Organize with categories", inline: true },
      { name: "Permissions", value: "Set channel permissions", inline: true },
      { name: "Auto Moderation", value: "Configure auto-mod", inline: true },
      { name: "Channel Settings", value: "Advanced settings", inline: true }
    ],
    timestamp: new Date()
  });

  const createTextButton = creators.createButton({
    customId: "channels:create:text",
    label: "Create Text",
    style: ButtonStyle.Primary,
    emoji: "💬"
  });

  const createVoiceButton = creators.createButton({
    customId: "channels:create:voice", 
    label: "Create Voice",
    style: ButtonStyle.Primary,
    emoji: "🔊"
  });

  const createCategoryButton = creators.createButton({
    customId: "channels:create:category",
    label: "Create Category",
    style: ButtonStyle.Secondary,
    emoji: "📁"
  });

  const manageButton = creators.createButton({
    customId: "channels:manage",
    label: "Manage",
    style: ButtonStyle.Secondary,
    emoji: "⚙️"
  });

  const permissionsButton = creators.createButton({
    customId: "channels:permissions",
    label: "Permissions",
    style: ButtonStyle.Secondary,
    emoji: "🔒"
  });

  const actionRow1 = creators.createActionRow(createTextButton, createVoiceButton, createCategoryButton);
  const actionRow2 = creators.createActionRow(manageButton, permissionsButton);

  const channelTypeSelect = creators.createSelectMenu({
    customId: "channels:type",
    placeholder: "Select channel type to manage...",
    options: [
      {
        label: "Text Channels",
        value: "text",
        description: "Manage text channels",
        emoji: "💬"
      },
      {
        label: "Voice Channels", 
        value: "voice",
        description: "Manage voice channels",
        emoji: "🔊"
      },
      {
        label: "Categories",
        value: "category",
        description: "Manage channel categories",
        emoji: "📁"
      },
      {
        label: "Forum Channels",
        value: "forum",
        description: "Manage forum channels",
        emoji: "📋"
      },
      {
        label: "Stage Channels",
        value: "stage",
        description: "Manage stage channels", 
        emoji: "🎭"
      }
    ]
  });

  const selectRow = creators.createActionRow(channelTypeSelect);

  return {
    embeds: [embed],
    components: [actionRow1, actionRow2, selectRow]
  };
}