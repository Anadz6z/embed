import { User, ButtonStyle } from "discord.js";
import { creators } from "../../discord/base/base.creators.js";

export function webhooksMenu(user: User, guildId?: string) {
  const embed = creators.createEmbed({
    title: "🔗 Webhook Management",
    description: "Manage server webhooks and integrations",
    color: 0x0099ff,
    author: {
      name: user.displayName,
      iconURL: user.displayAvatarURL()
    },
    fields: [
      { name: "Active Webhooks", value: "View all active webhooks", inline: true },
      { name: "Create Webhook", value: "Create new webhooks", inline: true },
      { name: "Edit Webhooks", value: "Modify existing webhooks", inline: true },
      { name: "Webhook Logs", value: "View webhook activity", inline: true },
      { name: "Security", value: "Webhook security settings", inline: true },
      { name: "Integrations", value: "Third-party integrations", inline: true }
    ],
    timestamp: new Date()
  });

  const createWebhookButton = creators.createButton({
    customId: "webhooks:create",
    label: "Create",
    style: ButtonStyle.Primary,
    emoji: "➕"
  });

  const listWebhooksButton = creators.createButton({
    customId: "webhooks:list",
    label: "List All",
    style: ButtonStyle.Secondary,
    emoji: "📋"
  });

  const editWebhookButton = creators.createButton({
    customId: "webhooks:edit",
    label: "Edit",
    style: ButtonStyle.Secondary,
    emoji: "✏️"
  });

  const logsButton = creators.createButton({
    customId: "webhooks:logs",
    label: "Logs",
    style: ButtonStyle.Secondary,
    emoji: "📊"
  });

  const securityButton = creators.createButton({
    customId: "webhooks:security",
    label: "Security",
    style: ButtonStyle.Danger,
    emoji: "🔒"
  });

  const actionRow1 = creators.createActionRow(createWebhookButton, listWebhooksButton, editWebhookButton);
  const actionRow2 = creators.createActionRow(logsButton, securityButton);

  const webhookTypeSelect = creators.createSelectMenu({
    customId: "webhooks:type",
    placeholder: "Select webhook type...",
    options: [
      {
        label: "Incoming Webhook",
        value: "incoming",
        description: "Receive data from external services",
        emoji: "📥"
      },
      {
        label: "Outgoing Webhook", 
        value: "outgoing",
        description: "Send data to external services",
        emoji: "📤"
      },
      {
        label: "GitHub Integration",
        value: "github",
        description: "GitHub repository webhooks",
        emoji: "🐙"
      },
      {
        label: "Custom Integration",
        value: "custom",
        description: "Custom webhook integration",
        emoji: "🔧"
      }
    ]
  });

  const selectRow = creators.createActionRow(webhookTypeSelect);

  return {
    embeds: [embed],
    components: [actionRow1, actionRow2, selectRow]
  };
}