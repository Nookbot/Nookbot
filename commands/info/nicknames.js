const moment = require('moment');

module.exports.run = async (client, message, args, level, Discord) => {
  const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' ')) || message.member;

  const nickArray = [];
  client.userDB.ensure(member.id, client.config.userDBDefaults).nicknames.forEach((n) => {
    nickArray.unshift(`${moment.utc(n.timestamp).format('DD MMM YY HH:mm')} UTC: ${n.nickname}`);
  });

  let currentPage = 1;
  const maxPage = Math.ceil(nickArray.length / 15) || 1;
  const embed = new Discord.MessageEmbed()
    .setTitle(`Past nicknames of ${member.user.tag}`)
    .setDescription(`\`\`\`${nickArray.slice(0, 15).join('\n') || 'No stored nicknames.'}\`\`\``)
    .setFooter(`Page ${currentPage}/${maxPage}`)
    .setTimestamp();

  const infoMessage = await message.channel.send(embed);
  if (nickArray.length > 15) {
    await infoMessage.react('⬅️');
    await infoMessage.react('➡️');
    const filter = (reaction, user) => (reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️') && !user.bot;
    const collector = infoMessage.createReactionCollector(filter, { time: 120000 });
    collector.on('collect', (r) => {
      if (r.emoji.name === '⬅️' && currentPage !== 1) {
        currentPage -= 1;
        embed.setDescription(`\`\`\`${nickArray.slice((currentPage - 1) * 15, currentPage * 15).join('\n')}\`\`\``);
        embed.setFooter(`Page ${currentPage}/${maxPage}`);
        infoMessage.edit(embed);
      } else if (r.emoji.name === '➡️' && currentPage !== maxPage) {
        currentPage += 1;
        embed.setDescription(`\`\`\`${nickArray.slice((currentPage - 1) * 15, currentPage * 15).join('\n')}\`\`\``);
        embed.setFooter(`Page ${currentPage}/${maxPage}`);
        infoMessage.edit(embed);
      }
    });
    collector.on('end', () => {
      embed.setFooter('No longer listening to reactions.');
      infoMessage.clearReactions();
      infoMessage.edit(embed);
    });
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['nn', 'nicks'],
  permLevel: 'Mod',
};

module.exports.help = {
  name: 'nicknames',
  category: 'info',
  description: 'Displays past nicknames for the given user',
  usage: 'nicknames <user>',
  details: '<user> => The user to display nickname information for.',
};
