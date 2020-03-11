module.exports.run = async (client, message, args, level, Discord) => {
  if (args.length === 0) {
    let listTags = '';

    client.tags.indexes.sort().forEach((t, i) => {
      if (i !== 0) listTags += `, ${t}`;
      else listTags += t;
    });

    const embed = new Discord.MessageEmbed()
      .setColor('#1de9b6')
      .setTitle(`Tags (${client.tags.count})`)
      .setDescription(listTags.slice(0, 2000) || 'No tags.')
      .setFooter('Use ".t name" to show a tag');

    message.channel.send(embed);
    return;
  }

  // Reserved words that cannot be used for tag names
  const reserved = ['create', 'c', 'add', 'make', 'edit', 'e', 'set', 'delete', 'del', 'd', 'remove', 'r'];

  switch (args[0].toLowerCase()) {
    case 'create':
    case 'c':
    case 'add':
    case 'make':
      // Check permissions to create tags
      if (!message.member.hasPermission('ADMINISTRATOR')) {
        client.error(message.channel, 'Cannot Create!', 'You do not have permission to create tags!');
        return;
      }

      // Check if a tag name was given
      if (args.length === 1) {
        client.error(message.channel, 'No Tag Name!', 'Make sure you include a tag name and the content for the tag!');
        return;
      }

      // Check if there is content for the tag
      if (args.length === 2) {
        client.error(message.channel, 'No Tag Content!', 'Make sure you include the content for the tag!');
        return;
      }

      // Check if they are making a tag with a reserved name
      if (reserved.indexOf(args[1].toLowerCase()) !== -1) {
        client.error(message.channel, 'Reserved Word!', 'You attempted to create a tag with a reserved word!');
        return;
      }

      // Check if the tag name they want to create already exists
      if (client.tags.has(args[1].toLowerCase())) {
        client.error(message.channel, 'Tag Already Exists!', 'That tag name is already used!');
        return;
      }

      // Finally add the tag to the database
      client.tags.set(args[1].toLowerCase(), args.slice(2).join(' '));
      client.success(message.channel, 'Tag Created!', `The tag **${args[1].toLowerCase()}** has been created!`);
      return;
    case 'edit':
    case 'e':
    case 'set':
      // Check permissions to edit tags
      if (!message.member.hasPermission('ADMINISTRATOR')) {
        client.error(message.channel, 'Cannot Edit!', 'You do not have permission to edit tags!');
        return;
      }

      // Check if a tag name was given
      if (args.length === 1) {
        client.error(message.channel, 'No Tag Name!', 'Make sure you include an existing tag name and the content to edit the tag with!');
        return;
      }

      // Check if there is content for the tag
      if (args.length === 2) {
        client.error(message.channel, 'No Tag Content!', 'Make sure you include the content to edit the tag with!');
        return;
      }

      // Check if the tag name they want to edit exists and edit it if it does
      if (client.tags.has(args[1].toLowerCase())) {
        client.tags.set(args[1].toLowerCase(), args.slice(2).join(' '));
        client.success(message.channel, 'Tag Edited!', `The tag **${args[1].toLowerCase()}** has been edited!`);
      } else {
        client.error(message.channel, 'Tag Does Not Exist!', 'The tag you attempted to edit does not exist!');
      }
      return;
    case 'delete':
    case 'del':
    case 'd':
    case 'remove':
    case 'r':
      // Check permissions to edit tags
      if (!message.member.hasPermission('ADMINISTRATOR')) {
        client.error(message.channel, 'Cannot Delete!', 'You do not have permission to delete tags!');
        return;
      }

      // Check if a tag name was given
      if (args.length === 1) {
        client.error(message.channel, 'No Tag Name!', 'Make sure you include a tag name to delete!');
        return;
      }

      // Check if the tag name they want to delete exists and delete it if it does
      if (client.tags.has(args[1].toLowerCase())) {
        client.tags.delete(args[1].toLowerCase());
        client.success(message.channel, 'Tag Deleted!', `The tag **${args[1].toLowerCase()}** has been deleted!`);
      } else {
        client.error(message.channel, 'Tag Does Not Exist!', 'The tag you attempted to delete does not exist!');
      }
      return;
    default:
      if (client.tags.has(args[0].toLowerCase())) {
        message.channel.send(client.tags.get(args[0].toLowerCase()));
      } else {
        client.error(message.channel, 'Tag Does Not Exist!', 'The tag you attempted to display does not exist!');
      }
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['t'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'tag',
  category: 'misc',
  description: 'Get, create, or list tags',
  usage: 'tag <create|edit|delete> <tag name> <content>',
  details: '<create|edit|delete> => Whether to create a new tag or edit/delete an existing one.\n<tag name> => The name of the tag you want to create/edit/delete.\n<content> => The content for the tag you want to create or edit.',
};
