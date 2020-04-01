// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  // Attempt to find a member using the arguments provided
  const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' '));

  if (!member) {
    return client.error('Invalid Member!', 'Please mention a valid member to upvote!');
  }

  if (member === message.member) {
    return client.error('No Upvoting Yourself!', 'You cannot upvote yourself!');
  }

  client.userDB.math(member.user.id, '+', 1, 'positiveRep');
  return client.success('Upvoted!', `Successfully upvoted **${member.user.tag}**!`);
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['repup', 'up'],
  permLevel: 'Verified',
  cooldown: 1800,
};

module.exports.help = {
  name: 'upvote',
  category: 'game',
  description: 'Upvotes the mentioned member',
  usage: 'upvote <@member>',
  details: '<@member> => The member you wish to upvote',
};
