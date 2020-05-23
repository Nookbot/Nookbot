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

  const { posRepList, negRepList } = client.userDB.ensure(member.id, client.config.userDBDefaults);

  if (posRepList.includes(message.author.id)) {
    return client.error(message.channel, 'Already Positively Rated!', `You have already given **${member.displayName}** a positive rating! You can never give them another positive rating.`);
  }

  if (negRepList.includes(message.author.id)) {
    client.userDB.math(member.id, '-', 1, 'negativeRep');
    client.userDB.remove(member.id, message.author.id, 'negRepList');
    client.userDB.math(member.id, '+', 1, 'positiveRep');
    client.userDB.push(member.id, message.author.id, 'posRepList');
    if (posRepList.length + 1 === client.config.positiveRepLimit) {
      message.guild.channels.cache.get(client.config.staffChat).send(`Positive Reputation Threshold Reached!\n**${member.user.tag}** (${member}) has reached **${client.config.positiveRepLimit}** positive reports!`);
    }
    return client.success(message.channel, 'Upvoted!', `Successfully changed your rating to upvote **${member.displayName}**!`);
  }

  client.userDB.math(member.id, '+', 1, 'positiveRep');
  client.userDB.push(member.id, message.author.id, 'posRepList');
  if (posRepList.length + 1 === client.config.positiveRepLimit) {
    message.guild.channels.cache.get(client.config.staffChat).send(`Positive Reputation Threshold Reached!\n**${member.user.tag}** (${member}) has reached **${client.config.positiveRepLimit}** positive reports!`);
  }
  return client.success(message.channel, 'Upvoted!', `Successfully upvoted **${member.displayName}**!`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['repup', 'up', 'uprep', '+rep', 'rep+'],
  permLevel: 'User',
  allowedChannels: ['549858839994826753'],
  cooldown: 300,
};

module.exports.help = {
  name: 'upvote',
  category: 'game',
  description: 'Upvotes the mentioned member',
  usage: 'upvote <@member>',
  details: '<@member> => The member you wish to upvote',
};
