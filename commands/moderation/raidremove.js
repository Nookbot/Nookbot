module.exports.run = (client, message, args) => {
  // Check if raid mode is active.
  if (!client.raidMode) {
    client.error(message.guild.channels.cache.get(client.getSettings(message.guild).staffChat),
      'Raid Mode is Not Activated!', 'The server must be in Raid Mode to use this command.');
    return;
  }

  // We are in raid mode, so remove the user from the list of raid joins.
  const index = client.raidJoins.indexOf(message.guild.members.cache.get(args[0]));
  if (index > -1) {
    const removed = client.raidJoins.splice(index, 1);
    client.raidMembersPrinted -= 1;
    client.success(message.guild.channels.cache.get(client.getSettings(message.guild).staffChat),
      'Member Removed From Raid!', `${removed.user.tag} (${removed.id}) was removed from the list of raid members and will not be banned.`);
  } else {
    client.error(message.guild.channels.cache.get(client.getSettings(message.guild).staffChat),
      'Member Not in Raid!', 'The User ID you provided is was not found in the raid.');
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['rr'],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'raidremove',
  category: 'moderation',
  description: 'Removes the member from the list of raid joins',
  usage: 'raidremove <ID>',
  details: '<ID> => The UserID of the member you wish to remove from the list of members to be banned in a raid.',
};
