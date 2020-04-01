// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' ')) || message.member;
  const rep = client.userDB.ensure(member.user.id, client.config.userDBDefaults);

  return message.channel.send(`**Postive Reputation:** ${rep.positiveRep}\n**Negative Reputation:** ${rep.negativeRep}\n\n**Total Reputation:** ${rep.positiveRep - rep.negativeRep}**`);
};

module.exports.conf = {
  guildOnly: false,
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
