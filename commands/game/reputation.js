// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' ')) || message.member;
  const { positiveRep, negativeRep } = client.userDB.ensure(member.id, client.config.userDBDefaults);

  if (positiveRep === 0 && negativeRep === 0) {
    return message.channel.send(`**${member.user.tag}**'s Reputation is **unknown**.`);
  }
  return message.channel.send(`**${member.user.tag}**'s Reputation is **${Math.round((positiveRep / ((positiveRep + negativeRep) || 1)) * 100)}%** positive based on **${positiveRep + negativeRep}** total ratings **(+${positiveRep}|-${negativeRep})**.`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['rep', 'repcheck'],
  permLevel: 'User',
  allowedChannels: ['549858839994826753'],
};

module.exports.help = {
  name: 'reputation',
  category: 'game',
  description: 'Checks the reputation of the member mentioned or the author',
  usage: 'reputation <@member>',
  details: '<@member> => Only neccessary if you wish to grab the reputation of another member',
};
