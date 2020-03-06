const moment = require('moment');

module.exports.run = async (client, message, args, level, Discord) => {
  const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' ')) || message.member;

  const userArray = [];
  client.userDB.ensure(member.id, client.config.userDBDefaults).usernames.forEach((u) => {
    userArray.unshift(`${moment.utc(u.timestamp).format('DD MMM YY HH:mm')} UTC: ${u.username}`);
  });

  let currentPage = 1;
  const maxPage = Math.ceil(userArray.length / 15) || 1;
  const embed = new Discord.MessageEmbed()
    .setTitle(`Past usernames of ${member.user.tag}`)
    .setDescription(`\`\`\`${userArray.slice(0, 15).join('\n') || 'No stored usernames.'}\`\`\``)
    .setFooter(`Page ${currentPage}/${maxPage}`)
    .setTimestamp();

  const infoMessage = await message.channel.send(embed);
  if (userArray.length > 15) {
    await infoMessage.react('⬅️');
    await infoMessage.react('➡️');
    const filter = (reaction, user) => (reaction.emoji.name === '⬅️' || reaction.emoji.name === '➡️') && !user.bot;
    const collector = infoMessage.createReactionCollector(filter, { time: 120000 });
    collector.on('collect', (r) => {
      if (r.emoji.name === '⬅️' && currentPage !== 1) {
        currentPage -= 1;
        embed.setDescription(`\`\`\`${userArray.slice((currentPage - 1) * 15, currentPage * 15).join('\n')}\`\`\``);
        embed.setFooter(`Page ${currentPage}/${maxPage}`);
        infoMessage.edit(embed);
      } else if (r.emoji.name === '➡️' && currentPage !== maxPage) {
        currentPage += 1;
        embed.setDescription(`\`\`\`${userArray.slice((currentPage - 1) * 15, currentPage * 15).join('\n')}\`\`\``);
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
  aliases: ['un', 'users'],
  permLevel: 'Mod',
};

module.exports.help = {
  name: 'usernames',
  category: 'info',
  description: 'Displays past usernames for the given user',
  usage: 'usernames <user>',
  details: '<user> => The user to display username information for.',
};
