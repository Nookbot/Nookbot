module.exports.run = (client, message, args, level, Discord) => {
  const { everyone } = message.guild.roles;
  const perms = new Discord.Permissions(everyone.permissions).add('SEND_MESSAGES');
  everyone.setPermissions(perms)
    .then(() => {
      client.success(message.channel, 'Server Unlocked!', 'Members can now send messages!');
      const generalChat = message.guild.channels.cache.get('538938170822230026');
      const acnhChat = message.guild.channels.cache.get('494376688877174785');
      const msg = "**Raid Mode Has Been Lifted**!\nWe've determined that it's safe to lift raid mode precautions and allow everyone to send messages again! Channels should open up again immediately, yes yes!";
      generalChat.send(msg);
      acnhChat.send(msg);
    })
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
