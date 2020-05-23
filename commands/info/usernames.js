const moment = require('moment');

// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level, Discord) => {
  let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' '));

  if (!member) {
    if (!args[0]) {
      member = message.member;
    } else if (client.userDB.get(parseInt(args[0], 10))) {
      member = parseInt(args[0], 10);
    } else {
      return client.error(message.channel, 'Member Not Found!', 'This member may have left the server or the id provided is not a member id!');
    }
  }

  const userArray = [];
  client.userDB.ensure(member === parseInt(args[0], 10) ? member : member.id, client.config.userDBDefaults).usernames.forEach((u) => {
    userArray.unshift(`${moment.utc(u.timestamp).format('DD MMM YY HH:mm')} UTC: ${u.username}`);
  });

  let currentPage = 1;
  const maxPage = Math.ceil(userArray.length / 15) || 1;
  const embed = new Discord.MessageEmbed()
    .setTitle(`Past usernames of ${member === parseInt(args[0], 10) ? member : member.user.tag}`)
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
      infoMessage.reactions.removeAll();
      infoMessage.edit(embed);
    });
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['un', 'users', 'username'],
  permLevel: 'Redd',
};

module.exports.help = {
  name: 'usernames',
  category: 'info',
  description: 'Displays past usernames for the given user',
  usage: 'usernames <user>',
  details: '<user> => The user to display username information for.',
};
