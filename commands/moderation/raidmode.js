module.exports.run = (client, message, args) => {
  // Check if raid mode is active, then activate raid mode
  if (!client.raidMode) {
    client.raidModeActivate(message.guild);
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['rm'],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'raidmode',
  category: 'moderation',
  description: 'Manually enable raid mode',
  usage: 'raidmode',
  details: 'There are no arguments. The server is placed into raid mode and will begin tracking all user joins and will block all messages.',
};