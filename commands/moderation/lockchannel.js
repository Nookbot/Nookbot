// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level, Discord) => {
  const channel = message.mentions.channels.first();
  const { everyone } = message.guild.roles;
  channel.overwritePermissions([{ id: everyone, deny: ['SEND_MESSAGES'] }])
    .then(() => {
      client.success(message.channel, 'Channel Locked!', 'No one can send messages until the channel is unlocked! To unlock the channel, use \`.unlockchannel\`.');
      channel.send("**Channel Locked**!\nWe're sorry to inconvenience everyone, but we've restricted all message sending capabilities in this channel for now. Don't worry though, you'll be back to chatting about your favorite game in no time, yes yes!");
    })
    .catch((error) => client.error(message.channel, 'Channel Lock Failed!', `The channel failed to be locked because: \`${error}\``));
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['lch', 'lockch'],
  permLevel: 'Mod',
};

module.exports.help = {
  name: 'lockchannel',
  category: 'moderation',
  description: 'Locks the mentioned channel down. No one can send messages in that channel.',
  usage: 'lockchannel <#channel>',
  details: '<#channel> => The channel to be locked.',
};
