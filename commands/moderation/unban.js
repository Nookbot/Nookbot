// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  // Grab the userID from arguments
  const userID = args[0];

  // Sets reason shown in audit logs
  const reason = args[1] ? args.slice(1).join(' ') : 'No reason provided';

  // Unbans the member
  return message.guild.members.unban(userID, reason)
    .then((user) => client.success(message.channel, 'Unban Successful!', `I've successfully unbanned **${user.tag}**!`))
    .catch((error) => client.error(message.channel, 'Unban Failed!', `I've failed to unban this user! Error: ${error}`));
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['ub'],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'unban',
  category: 'moderation',
  description: 'Unbans the user. Can be used with or without a stated reason.',
  usage: 'unban <userID> <reason>',
  details: '<userID> => Any valid userID.\n<reason> => The reason for the unban. Totally optional.',
};
