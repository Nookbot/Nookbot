// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level, Discord) => {
  const channel = message.mentions.channels.first();
  const { everyone } = message.guild.roles;
  channel.overwritePermissions([{ id: everyone, allow: ['SEND_MESSAGES'] }])
    .then(() => {
      client.success(message.channel, 'Channel Unlocked!', 'Members can now send messages in that channel!');
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
  description: 'Unlocks the mentioned channel. Members can send message in that channel again.',
  usage: 'lockchannel <#channel>',
  details: '<#channel> => The channel to be unlocked.',
};
