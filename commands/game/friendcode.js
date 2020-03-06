// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level, Discord) => {
  let code;
  let fc;
  let member;
  const embed = new Discord.MessageEmbed();
  switch (args[0]) {
    case 'set':
    case 'add':
      if (args.length === 1) {
        return client.error(message.channel, 'No Code Given!', 'Please supply your Switch friend code!');
      }

      code = args.slice(1).join().replace(/[\D]/g, '');

      if (code.length !== 12) {
        return client.error(message.channel, 'Invalid Code!', 'The code must have 12 digits!');
      }

      code = `SW-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
      client.userDB.set(message.author.id, code, 'friendcode');

      embed.setAuthor(`${message.member.displayName}'s Friend Code`, message.author.displayAvatarURL())
        .setTitle('Successfully set your friend code!')
        .setColor('#e4000f')
        .setDescription(`**${code}**`);

      return message.channel.send(embed);
    case 'del':
    case 'delete':
    case 'remove':
      if (client.userDB.has(message.author.id, 'friendcode')) {
        client.userDB.delete(message.author.id, 'friendcode');
        return client.success(message.channel, 'Successfully Deleted!', "I've successfully deleted your friend code! You can set it again by typing \`.fc set <code>\`!");
      }
      return client.error(message.channel, 'No Friend Code To Remove!', 'You did not have a friend code in the database. You can set it by typing \`.fc set <code>\`!');
    default:
      if (args.length === 0) {
        // Return user's friend code if they have one
        fc = client.userDB.ensure(message.author.id, client.config.userDBDefaults).friendcode;
        if (!fc) {
          return client.error(message.channel, 'No Code Found!', 'You have not set a friend code! You can do so by running \`.fc set <code>\`!');
        }

        embed.setAuthor(`${message.member.displayName}'s Friend Code`, message.author.displayAvatarURL())
          .setColor('#e4000f')
          .setDescription(`**${fc}**`);

        return message.channel.send(embed);
      }

      // Attempt to find a member using the arguments provided
      member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' '));

      if (member) {
        fc = client.userDB.ensure(member.user.id, client.config.userDBDefaults).friendcode;
        if (!fc) {
          return client.error(message.channel, 'No Code Found!', `${member.displayName} has not set their friend code!`);
        }

        embed.setAuthor(`${member.displayName}'s Friend Code`, member.user.displayAvatarURL())
          .setColor('#e4000f')
          .setDescription(`**${fc}**`);

        return message.channel.send(embed);
      }

      return client.error(message.channel, 'Unknown Member!', 'Could not find a member by that name!');
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
