module.exports.run = (client, message, args, level, Discord) => {
  const everyone = message.channel.guild.defaultRole;
  const perms = new Discord.Permissions(everyone.permissions).add('SEND_MESSAGES');
  everyone.setPermissions(perms)
    .then(() => client.success(message.channel, 'Server Unlocked!', 'Members can now send messages!'))
    .catch((error) => client.error(message.channel, 'Unlock Failed!', `The server failed to be unlocked because: \`${error}\``));
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['u', 'uld', 'unlock'],
  permLevel: 'Mod',
};

module.exports.help = {
  name: 'unlockdown',
  category: 'moderation',
  description: 'Unlocks the server. Members can send messages again.',
  usage: 'unlockdown',
  details: 'There are no arguments. The lockdown command is used to lock the server down.',
};
