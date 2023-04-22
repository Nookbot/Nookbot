/* eslint-disable no-await-in-loop */
// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const rooms = [
    '750150465072922724',
    '750150495221448785',
    '781768073832693760',
  ];

  switch (args[0]) {
    case 'add':
    case 'a': {
      if (!rooms.includes(message.channel.id)) {
        return client.error(message.channel, 'Not a Middleman Channel!', 'Please use this command in a middleman channel!');
      }

      const membersToAdd = message.mentions.members.size ? message.mentions.members.map((m) => m.id) : args.slice(1);
      try {
        for (let i = 0; i < membersToAdd.length; i++) {
          await message.channel.permissionOverwrites.create(membersToAdd[i].trim(), {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            READ_MESSAGE_HISTORY: true,
          });
        }
      } catch (e) {
        return client.error(message.channel, 'Error!', e);
      }
      client.success(message.channel, 'Success!', `Successfully added ${membersToAdd.map((m) => (parseInt(m.trim(), 10) ? `<@${m.trim()}>` : m)).join(' and ')}!`);
      break;
    }
    case 'reset':
    case 'r': {
      if (!rooms.includes(message.channel.id)) {
        return client.error(message.channel, 'Not a Middleman Channel!', 'Please use this command in a middleman channel!');
      }

      const memberOverwrites = message.channel.permissionOverwrites.cache.filter((perm) => perm.type === 'member').map((perm) => perm);
      for (let i = 0; i < memberOverwrites.length; i++) {
        await memberOverwrites[i].delete();
      }
      client.success(message.channel, 'Success!', 'Successfully reset this middleman channel!');
      break;
    }
    case 'lock':
    case 'l': {
      const requestChannel = client.channels.cache.get('750150303692619817');
      await requestChannel.permissionOverwrites.edit(client.config.mainGuild, { SEND_MESSAGES: false });
      client.success(message.channel, 'Success!', `Successfully locked ${requestChannel}!`);
      break;
    }
    case 'unlock':
    case 'ul':
    case 'unl': {
      const requestChannel = client.channels.cache.get('750150303692619817');
      await requestChannel.permissionOverwrites.edit(client.config.mainGuild, { SEND_MESSAGES: true });
      client.success(message.channel, 'Success!', `Successfully unlocked ${requestChannel}!`);
      break;
    }
    default:
      // Nothing
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['mm'],
  permLevel: 'Copper & Booker',
  args: 1,
};

module.exports.help = {
  name: 'middleman',
  category: 'misc',
  description: 'Controls middleman functions',
  usage: 'mm <add|reset> <@members>',
  details: '<add|reset> => Whether to add members to the room or reset the room.\n<@members> => Any members you wish to add to the room.',
};
