import { User, ButtonStyle } from "discord.js";
import { creators } from "../../discord/base/base.creators.js";

export function navMenu(user: User, currentPage: string = "home") {
  const pages = {
    home: "🏠 Home",
    profile: "👤 Profile", 
    settings: "⚙️ Settings",
    help: "❓ Help"
  };

  const embed = creators.createEmbed({
    title: `${pages[currentPage as keyof typeof pages] || pages.home}`,
    description: `You are currently viewing: **${currentPage}**`,
    color: 0x0099ff,
    author: {
      name: user.displayName,
      iconURL: user.displayAvatarURL()
    },
    timestamp: new Date()
  });

  const navButtons = Object.entries(pages).map(([key, label]) =>
    creators.createButton({
      customId: `nav:${key}`,
      label: label.split(' ')[1],
      style: key === currentPage ? ButtonStyle.Primary : ButtonStyle.Secondary,
      emoji: label.split(' ')[0]
    })
  );

  const actionRow = creators.createActionRow(...navButtons);

  return {
    embeds: [embed],
    components: [actionRow]
  };
}