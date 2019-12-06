// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level, Discord) => {
  const member = message.mentions.members.first() || message.guild.members.get(args[0]) || message.member;

  const embed = new Discord.RichEmbed()
    .setAuthor(`${member.displayName}'s Friend Code`, member.user.displayAvatarURL)
    .setColor('#e4000f');

  const fc = client.userDB.ensure(member.user.id, { friendcode: '' }).friendcode;

  if (args.length === 0 || member !== message.member || message.member === message.mentions.members.first() || message.member === message.guild.members.get(args[0])) {
    if (!fc && member !== message.member) {
      return client.error(message.channel, 'No Code Found!', 'That user has not set their friend code!');
    }

    if (!fc) {
      return client.error(message.channel, 'No Code Found!', 'You have not set a friend code! You can do so by running \`.fc set <code>\`!');
    }

    embed.setDescription(`**${fc}**`);
    return message.channel.send(embed);
  }

  switch (args[0]) {
    case 'set':
    case 'add': {
      if (args.length === 1) {
        return client.error(message.channel, 'No Code Given!', 'Please supply your Switch friend code!');
      }

      let code = args.slice(1).join('-');

      if (!/^(SW-)?[0-9]{4}-[0-9]{4}-[0-9]{4}$/i.test(code)) {
        return client.error(message.channel, 'Invalid Code!', 'Please check to see if the code was typed correctly and include all dashes!');
      }

      code = /SW-/i.test(code) ? code : `SW-${code}`;
      client.userDB.set(member.user.id, code, 'friendcode');
      embed.setTitle('Successfully set your friend code!')
        .setDescription(`**${code}**`);

      message.channel.send(embed);
      break;
    }
    case 'del':
    case 'delete':
    case 'remove':
      client.userDB.delete(member.user.id, 'friendcode');
      client.success(message.channel, 'Successfully Deleted!', "I've successfully deleted your friend code! You can set it again by running \`.fc set <code>\`!");
      break;
    default:
      client.error(message.channel, 'Invalid Subcommand!', `Remember to use subcommands when using this command! For example: \`set\` or \`del\`! For further details, use \`${client.getSettings(message.guild).prefix}help friendcode\`!`);
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
  category: 'game',
  description: 'Switch friend code management',
  usage: 'friendcode <set|del> <code|@member>',
  details: "<set|del> => Whether to set a new friend code or delete an existing one.\n<code|@member> => Only necessary if you're setting a new code or getting the code of another member.",
};
