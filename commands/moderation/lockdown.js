module.exports.run = (client, message, args, level, Discord) => {
  const everyone = message.channel.guild.defaultRole;
  const perms = new Discord.Permissions(everyone.permissions).remove('SEND_MESSAGES');
  everyone.setPermissions(perms)
    .then(() => client.success(message.channel, 'Server Locked Down!', 'No one can send messages until the server is unlocked! To unlock the server, use \`.unlockdown\`.'))
    .catch((error) => client.error(message.channel, 'Lock Down Failed!', `The server failed to be locked down because: \`${error}\``));
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['l', 'ld', 'lock'],
  permLevel: 'Mod',
};

module.exports.help = {
  name: 'lockdown',
  category: 'moderation',
  description: 'Locks the server down. No one can send messages.',
  usage: 'lockdown',
  details: 'There are no arguments. The unlockdown command is used to open the server back up.',
};
