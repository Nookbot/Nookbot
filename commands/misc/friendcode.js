// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level, Discord) => {
  const member = message.mentions.members.first() || message.member;
  const owner = await client.fetchOwner();

  const embed = new Discord.RichEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL)
    .setTitle(`${member.displayName}'s Friend Code`)
    .setColor('#e60012')
    .setTimestamp()
    .setFooter(`Created and Maintained by ${owner.tag} | ${client.version}`, client.user.displayAvatarURL);

  const fc = client.friendCodes.ensure(message.author.id, '');

  if (member === message.mentions.members.first()) {
    const memberFC = client.friendCodes.get(member.user.id);
    if (!memberFC) {
      return message.error('No Code Found!', 'That user has not set their friend code!');
    }
    embed.setDescription(`**${memberFC}**`);

    return message.channel.send(embed);
  }

  if (args.length === 0) {
    if (!fc) {
      return message.error('No Code Found!', 'You have not set a friend code! You can do so by running \`.fc set <code>\`!');
    }

    embed.setDescription(`**${fc}**`);
    return message.channel.send(embed);
  }

  switch (args[0]) {
    case 'set': 
    case 'add': {
      if (args.length === 1) {
        return message.error('No Code Given!', 'Please supply your Switch friend code!');
      }
      
      let code = args[1];

      if (/^(SW-)?[0-9]{4}-[0-9]{4}-[0-9]{4}$/i.test(code)) {
        return message.error('Invalid Code!', 'Please check to see if the code was typed correctly and include all dashes!');
      }

      code = /SW-/i.test(code) ? code : `SW-${code}`;
      client.friendCodes.set(message.author.id, code);
      embed.setDescription(`Successfully set your friend code!\n**${code}**`);

      message.channel.send(embed);
      break;
    }
    case 'del':
    case 'delete':
    case 'remove':
      client.friendCodes.delete(message.author.id);
      message.success('Successfully Deleted!', "I've successfully deleted your friend code! You can set it again by running \`.fc set <code>\`!");
      break;
    default:
      message.error('Invalid Subcommand!', `Remember to use subcommands when using this command! For example: \`set\` or \`del\`! For further details, use \`${client.getSettings(message.guild).prefix}help friendcode\`!`);
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
  description: 'Switch friend code management',
  usage: 'friendcode <set|del> <code|@member>',
  details: "<set|del> => Whether to set a new friend code or delete an existing one.\n<code|@member> => Only necessary if you're setting a new code or getting the code of another member.",
};