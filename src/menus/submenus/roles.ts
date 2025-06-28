import { User, ButtonStyle } from "discord.js";
import { creators } from "../../discord/base/base.creators.js";

export function rolesMenu(user: User, guildId?: string) {
  const embed = creators.createEmbed({
    title: "👥 Role Management",
    description: "Manage server roles and permissions",
    color: 0x0099ff,
    author: {
      name: user.displayName,
      iconURL: user.displayAvatarURL()
    },
    fields: [
      { name: "Create Roles", value: "Create new server roles", inline: true },
      { name: "Edit Roles", value: "Modify existing roles", inline: true },
      { name: "Role Hierarchy", value: "Manage role order", inline: true },
      { name: "Permissions", value: "Set role permissions", inline: true },
      { name: "Auto Roles", value: "Automatic role assignment", inline: true },
      { name: "Role Colors", value: "Customize role colors", inline: true }
    ],
    timestamp: new Date()
  });

  const createRoleButton = creators.createButton({
    customId: "roles:create",
    label: "Create Role",
    style: ButtonStyle.Primary,
    emoji: "➕"
  });

  const editRoleButton = creators.createButton({
    customId: "roles:edit",
    label: "Edit Roles",
    style: ButtonStyle.Secondary,
    emoji: "✏️"
  });

  const hierarchyButton = creators.createButton({
    customId: "roles:hierarchy",
    label: "Hierarchy",
    style: ButtonStyle.Secondary,
    emoji: "📊"
  });

  const permissionsButton = creators.createButton({
    customId: "roles:permissions",
    label: "Permissions",
    style: ButtonStyle.Secondary,
    emoji: "🔒"
  });

  const autoRolesButton = creators.createButton({
    customId: "roles:auto",
    label: "Auto Roles",
    style: ButtonStyle.Secondary,
    emoji: "🤖"
  });

  const actionRow1 = creators.createActionRow(createRoleButton, editRoleButton, hierarchyButton);
  const actionRow2 = creators.createActionRow(permissionsButton, autoRolesButton);

  const roleSelect = creators.createSelectMenu({
    customId: "roles:select",
    placeholder: "Select a role to manage...",
    options: [
      {
        label: "Administrator",
        value: "admin",
        description: "Full server permissions",
        emoji: "👑"
      },
      {
        label: "Moderator",
        value: "moderator", 
        description: "Moderation permissions",
        emoji: "🛡️"
      },
      {
        label: "Member",
        value: "member",
        description: "Basic member role",
        emoji: "👤"
      },
      {
        label: "Bot",
        value: "bot",
        description: "Bot-specific roles",
        emoji: "🤖"
      }
    ]
  });

  const selectRow = creators.createActionRow(roleSelect);

  return {
    embeds: [embed],
    components: [actionRow1, actionRow2, selectRow]
  };
}