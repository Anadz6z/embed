import { User, ButtonStyle } from "discord.js";
import { creators } from "../discord/base/base.creators.js";

export function tabsMenu(user: User, activeTab: string = "overview") {
  const tabs = {
    overview: {
      title: "📊 Overview",
      description: "General information and statistics",
      content: "Welcome to the overview tab! Here you can see general information about the bot and server."
    },
    settings: {
      title: "⚙️ Settings",
      description: "Configuration and preferences",
      content: "Configure bot settings, permissions, and preferences for your server."
    },
    moderation: {
      title: "🛡️ Moderation",
      description: "Moderation tools and logs",
      content: "Access moderation tools, view logs, and manage server security features."
    },
    analytics: {
      title: "📈 Analytics",
      description: "Usage statistics and reports",
      content: "View detailed analytics, usage statistics, and performance reports."
    },
    help: {
      title: "❓ Help",
      description: "Documentation and support",
      content: "Find help documentation, tutorials, and contact support if needed."
    }
  };

  const currentTab = tabs[activeTab as keyof typeof tabs] || tabs.overview;

  const embed = creators.createEmbed({
    title: currentTab.title,
    description: currentTab.content,
    color: 0x0099ff,
    author: {
      name: user.displayName,
      iconURL: user.displayAvatarURL()
    },
    footer: { text: currentTab.description },
    timestamp: new Date()
  });

  const tabButtons = Object.entries(tabs).map(([key, tab]) => 
    creators.createButton({
      customId: `tabs:${key}`,
      label: tab.title.split(' ')[1], // Remove emoji for button label
      style: key === activeTab ? ButtonStyle.Primary : ButtonStyle.Secondary,
      emoji: tab.title.split(' ')[0] // Use emoji from title
    })
  );

  // Split buttons into rows (max 5 per row)
  const buttonRows = [];
  for (let i = 0; i < tabButtons.length; i += 5) {
    const rowButtons = tabButtons.slice(i, i + 5);
    buttonRows.push(creators.createActionRow(...rowButtons));
  }

  return {
    embeds: [embed],
    components: buttonRows
  };
}