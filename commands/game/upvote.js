// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  // Attempt to find a member using the arguments provided
  const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' '));

  if (!member) {
    return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member to upvote!');
  }

  if (member.id === message.author.id) {
    return client.error(message.channel, 'No Upvoting Yourself!', 'You cannot upvote yourself!');
  }

  client.userDB.ensure(member.id, client.config.userDBDefaults);

  client.userDB.math(member.id, '+', 1, 'positiveRep');
  return client.success(message.channel, 'Upvoted!', `Successfully upvoted **${member.user.tag}**!`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['repup', 'up'],
  permLevel: 'Verified',
  allowedChannels: ['549858839994826753'],
  cooldown: 1800,
};

module.exports.help = {
  name: 'upvote',
  category: 'game',
  description: 'Upvotes the mentioned member',
  usage: 'upvote <@member>',
  details: '<@member> => The member you wish to upvote',
};
