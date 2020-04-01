// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  // Attempt to find a member using the arguments provided
  const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' '));

  if (!member) {
    return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member to downvote!');
  }

  if (member.id === message.author.id) {
    return client.error(message.channel, 'No Downvoting Yourself!', 'You cannot downvote yourself!');
  }

  client.userDB.ensure(member.id, client.config.userDBDefaults);

  client.userDB.math(member.id, '+', 1, 'negativeRep');
  return client.success(message.channel, 'Downvoted!', `Successfully downvoted **${member.user.tag}**!`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['repdown', 'down'],
  permLevel: 'Verified',
  allowedChannels: ['549858839994826753'],
  cooldown: 1800,
};

module.exports.help = {
  name: 'downvote',
  category: 'game',
  description: 'Downvotes the mentioned member',
  usage: 'downvote <@member>',
  details: '<@member> => The member you wish to downvote',
};
