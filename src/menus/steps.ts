import { User, ButtonStyle } from "discord.js";
import { creators } from "../discord/base/base.creators.js";

export function stepsMenu(user: User, currentStep: number = 1) {
  const totalSteps = 5;
  const progress = Math.round((currentStep / totalSteps) * 100);
  
  const stepTitles = [
    "Welcome & Introduction",
    "Basic Configuration",
    "Advanced Settings",
    "Testing & Verification",
    "Completion & Summary"
  ];

  const stepDescriptions = [
    "Get started with the setup process",
    "Configure basic bot settings",
    "Set up advanced features",
    "Test your configuration",
    "Review and finalize setup"
  ];

  const embed = creators.createEmbed({
    title: `📋 Setup Steps (${currentStep}/${totalSteps})`,
    description: `**Current Step:** ${stepTitles[currentStep - 1]}\n${stepDescriptions[currentStep - 1]}`,
    color: 0x00ff00,
    fields: [
      { name: "Progress", value: `${progress}% Complete`, inline: true },
      { name: "Current Step", value: `${currentStep}/${totalSteps}`, inline: true },
      { name: "Status", value: currentStep === totalSteps ? "✅ Complete" : "🔄 In Progress", inline: true }
    ],
    footer: { text: `Step ${currentStep} of ${totalSteps}` },
    timestamp: new Date()
  });

  const previousButton = creators.createButton({
    customId: `steps:previous:${currentStep}`,
    label: "Previous",
    style: ButtonStyle.Secondary,
    emoji: "⬅️",
    disabled: currentStep === 1
  });

  const nextButton = creators.createButton({
    customId: `steps:next:${currentStep}`,
    label: "Next",
    style: ButtonStyle.Primary,
    emoji: "➡️",
    disabled: currentStep === totalSteps
  });

  const skipButton = creators.createButton({
    customId: `steps:skip:${currentStep}`,
    label: "Skip",
    style: ButtonStyle.Secondary,
    emoji: "⏭️",
    disabled: currentStep === totalSteps
  });

  const resetButton = creators.createButton({
    customId: "steps:reset",
    label: "Reset",
    style: ButtonStyle.Danger,
    emoji: "🔄"
  });

  const actionRow = creators.createActionRow(previousButton, nextButton, skipButton, resetButton);

  return {
    embeds: [embed],
    components: [actionRow]
  };
}