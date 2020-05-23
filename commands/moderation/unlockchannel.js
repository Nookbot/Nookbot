// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level, Discord) => {
  const channel = message.mentions.channels.first() || message.channel;
  if (channel.permissionsFor(message.guild.id).has('SEND_MESSAGES')) {
    client.error(message.channel, 'Channel Already Unlocked!', `Everyone already has permission to send messages in ${channel}!`);
    return;
  }
  channel.updateOverwrite(message.guild.id, { 'SEND_MESSAGES': null }, 'Unlock Channel')
    .then(() => {
      if (channel.id !== message.channel.id) {
        client.success(message.channel, 'Channel Unlocked!', 'Members can now send messages in that channel!');
      }
      channel.send("**Channel Unlocked**!\nWe've determined that it's safe to lift channel lock precautions and allow everyone to send messages again, yes yes!");
    })
    .catch((error) => client.error(message.channel, 'Channel Unlock Failed!', `The channel failed to be unlocked because: \`${error}\``));
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['uch', 'unlockch', 'unch'],
  permLevel: 'Mod',
};

module.exports.help = {
  name: 'unlockchannel',
  category: 'moderation',
  description: 'Unlocks the mentioned channel or the channel the command is used in. Members can send message in that channel again.',
  usage: 'unlockchannel <#channel>',
  details: '<#channel> => The channel to be unlocked.',
};
