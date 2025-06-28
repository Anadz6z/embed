export const VERSION = "1.0.0";
export const DISCORD_JS_VERSION = "14.14.1";

export function getVersionInfo() {
  return {
    botVersion: VERSION,
    discordJsVersion: DISCORD_JS_VERSION,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };
}

export function logVersionInfo() {
  const info = getVersionInfo();
  console.log("=".repeat(50));
  console.log("Discord Bot Version Information");
  console.log("=".repeat(50));
  console.log(`Bot Version: ${info.botVersion}`);
  console.log(`Discord.js Version: ${info.discordJsVersion}`);
  console.log(`Node.js Version: ${info.nodeVersion}`);
  console.log(`Platform: ${info.platform} (${info.arch})`);
  console.log("=".repeat(50));
}