// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level, Discord) => {
  const categories = ['588553279705972743', '701250813007233104', '693857451178590208', '588552991326470155'];

  categories.forEach((cat) => {
    const catObj = client.channels.cache.get(cat);

    if (catObj.permissionsFor(client.config.tradeRole).has('SEND_MESSAGES')) {
      const msgToSend = args[0] ? args[0].join(' ') : '**Channel Locked**!\nThis channel has been locked due to scheduled server maintenance. It will be unlocked when maintenance is completed.';

      catObj.permissionOverwrites.edit(client.config.tradeRole, { SEND_MESSAGES: false }, 'Lock Channel for Maintenance')
        .then((c) => {
          c.children.forEach((channel) => {
            channel.send(msgToSend);
          });
        })
        .catch((error) => client.error(message.channel, 'Trade Lock Failed!', `The trade lock failed to complete because: \`${error}\``));
    } else {
      const msgToSend = args[0] ? args[0].join(' ') : '**Channel Unlocked**!\nMaintenance has completed so this channel is now unlocked!';

      catObj.permissionOverwrites.edit(client.config.tradeRole, { SEND_MESSAGES: true }, 'Unlock Channel After Maintenance')
        .then((c) => {
          c.children.forEach((channel) => {
            channel.send(msgToSend);
          });
        })
        .catch((error) => client.error(message.channel, 'Trade Unlock Failed!', `The trade unlock failed to complete because: \`${error}\``));
    }
  });
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['trlk', 'tl'],
  permLevel: 'Head Mod',
};

module.exports.help = {
  name: 'tradelock',
  category: 'moderation',
  description: 'Locks the trade channels. Generally used for when server maintenance occurs.',
  usage: 'tradelock <message>',
  details: '<message> => The message to send to the trade channels. If no message is given, a default message is used.',
};
