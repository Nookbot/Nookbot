// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  // Attempt to find a member using the arguments provided
  const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' '));

  // Delete the message to protect those that report users
  message.delete();

  if (!member) {
    return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member to downvote!');
  }

  if (member.id === message.author.id) {
    return client.error(message.channel, 'No Downvoting Yourself!', 'You cannot downvote yourself!');
  }

  const { posRepList, negRepList } = client.userDB.ensure(member.id, client.config.userDBDefaults);

  if (negRepList.includes(message.author.id)) {
    return client.error(message.channel, 'Already Negatively Rated!', `You have already given **${member.displayName}** a negative rating! You can never give them another negative rating.`);
  }

  if (posRepList.includes(message.author.id)) {
    client.userDB.math(member.id, '-', 1, 'positiveRep');
    client.userDB.remove(member.id, message.author.id, 'posRepList');
    client.userDB.math(member.id, '+', 1, 'negativeRep');
    client.userDB.push(member.id, message.author.id, 'negRepList');
    if (negRepList.length + 1 === client.config.negativeRepLimit) {
      message.guild.channels.cache.get(client.config.staffChat).send(`Negative Reputation Threshold Reached!\n**${member.user.tag}** (${member}) has reached **${client.config.negativeRepLimit}** negative reports!`);
    }
    return client.success(message.channel, 'Downvoted!', `Successfully changed your rating to downvote **${member.displayName}**!`);
  }

  client.userDB.math(member.id, '+', 1, 'negativeRep');
  client.userDB.push(member.id, message.author.id, 'negRepList');
  if (negRepList.length + 1 === client.config.negativeRepLimit) {
    message.guild.channels.cache.get(client.config.staffChat).send(`Negative Reputation Threshold Reached!\n**${member.user.tag}** (${member}) has reached **${client.config.negativeRepLimit}** negative reports!`);
  }
  return client.success(message.channel, 'Downvoted!', `Successfully downvoted **${member.displayName}**!`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['repdown', 'down', 'downrep', '-rep', 'rep-'],
  permLevel: 'User',
  allowedChannels: ['549858839994826753'],
  cooldown: 300,
};

module.exports.help = {
  name: 'downvote',
  category: 'game',
  description: 'Downvotes the mentioned member',
  usage: 'downvote <@member>',
  details: '<@member> => The member you wish to downvote',
};
