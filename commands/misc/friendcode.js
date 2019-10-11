// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level, Discord) => {
  const member = message.mentions.members.first() || message.member;
  const owner = await client.fetchOwner();

  const embed = new Discord.RichEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL)
    .setTitle(`${member.displayName}'s Friend Code`)
    .setColor('#4199c2')
    .setTimestamp()
    .setFooter(`Created and Maintained by ${owner.tag} | ${client.version}`, client.user.displayAvatarURL);

  const fc = client.friendCodes.ensure(message.author.id, {});

  if (member === message.mentions.members.first()) {
    const memberFC = client.friendCodes.get(member.user.id);
    if (!memberFC) {
      return message.error('No Code Found!', 'That user has not set their friend code!');
    }
    embed.setDescription(`**${memberFC}**`);

    return message.channel.send(embed);
  }

  if (!args[0]) {
    if (!fc) {
      return message.error('No Code Found!', 'You have not set a friend code! You can do so by running \`.friendcode <code>\`!');
    }

    embed.setDescription(`**${fc}**`);
    return message.channel.send(embed);
  }

  switch (message.flags[0]) {
    case 'set': {
      if (fc) {
        return message.error('Code Already in Database!', 'You already have a friend code set! You can delete it by running \`.friendcode delete\`!');
      }

      const code = args[1].toUpperCase();

      if (code.length !== 17 || code.charAt(0) !== 'S' || code.charAt(1) !== 'W' || code.charAt(2) !== '-' || code.charAt(7) !== '-' || code.charAt(12) !== '-') {
        return message.error('Invalid Code!', 'Please check to see if the code was typed correctly and include all dashes and \`SW\` at the beginning!');
      }

      client.friendCodes.set(message.author.id, code);
      embed.setDescription(`Successfully set your friend code!\n**${code}**`);

      message.channel.send(embed);
      break;
    }
    case 'del':
      client.friendCodes.delete(message.author.id);
      message.success('Successfully Deleted!', "I've successfully deleted your friend code from the database! You can set it again by running \`.fc -set <code>\`!");
      break;
    default:
      message.error('Invalid Flag!', `Remember to use flags when using this command! For example: \`-set\` or \`-del\`! For further details, use \`${client.getSettings(message.guild).prefix}help friendcode\`!`);
      break;
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['fc'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'friendcode',
  category: 'misc',
  description: 'Controls the friendcode db',
  usage: 'friendcode <-set|-get|-del> <code|@member>',
  details: "<-set|-get|-del> => Whether to set a new friend code, get an existing one, or delete an existing one. (Notice the - it's important)\n<code|@member> => Only necessary if you're setting a new code or getting the code of another member.",
};
