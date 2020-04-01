// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' ')) || message.member;
  const { positiveRep } = client.userDB.get(member.user.id);
  const { negativeRep } = client.userDB.get(member.user.id);

  if (!positiveRep || !negativeRep) {
    client.userDB.set(member.user.id, 0, 'positiveRep');
    client.userDB.set(member.user.id, 0, 'negativeRep');
  }

  return message.channel.send(`**Postive Reputation:** ${positiveRep}\n**Negative Reputation:** ${negativeRep}\n\n**Total Reputation:** ${positiveRep - negativeRep}**`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['rep', 'repcheck'],
  permLevel: 'Verified',
};

module.exports.help = {
  name: 'reputation',
  category: 'game',
  description: 'Checks the reputation of the member mentioned or the author',
  usage: 'reputation <@member>',
  details: '<@member> => Only neccessary if you wish to grab the reputation of another member',
};
