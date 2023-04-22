// eslint-disable-next-line consistent-return
module.exports.run = (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const link = args.filter((a) => a.match(/https?:\/\/([\w_-]+(?:(?:\.[\w_-]+)+))/gi))[0];

  if (!link) {
    return client.error(message.channel, 'No Link!', "You didn't supply a link!");
  }

  switch (args[0]) {
    case 'add':
    case 'a': {
      if (client.linkWhitelist.get('links').includes(link)) {
        return client.error(message.channel, 'Already Whitelisted!', 'This link is already whitelisted!');
      }

      client.linkWhitelist.push('links', link);

      client.success(message.channel, 'Successfully Whitelisted Link!', `I've successfully whitelisted \`${link}\`!`);
      break;
    }
    case 'remove':
    case 'rem':
    case 'r':
    case 'delete':
    case 'del':
    case 'd': {
      if (!client.linkWhitelist.get('links').includes(link)) {
        return client.error(message.channel, 'Link Not Whitelisted!', 'This link is not whitelisted!');
      }

      client.linkWhitelist.remove('links', link);

      client.success(message.channel, 'Successfully Removed Link!', `I've successfully removed \`${link}\` from the whitelist!`);
      break;
    }
    default:
      client.error(message.channel, 'Invalid Usage!', "You need to specify if you're adding or removing a link to/from the whitelist! Usage: \`.link <add|remove> <link>\`");
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: [],
  permLevel: 'Head Mod',
  args: 2,
};

module.exports.help = {
  name: 'link',
  category: 'moderation',
  description: 'Adds or removes links to/from the link whitelist',
  usage: 'link <add|remove> <link>',
  details: '<add|remove> => Whether to add or remove a link to/from the whitelist.\n<link> => The link to add or remove to/from the whitelist.',
};
