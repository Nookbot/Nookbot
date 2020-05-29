/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  const channel = message.mentions.channels.first() || message.channel;
  const newSlowmodeSeconds = parseInt(args.find((num) => !isNaN(num)), 10);

  if (!newSlowmodeSeconds || isNaN(newSlowmodeSeconds)) {
    return client.error(message.channel, 'Invalid Slowmode Argument!', 'Please provide a valid number of seconds to set the slowmode to!');
  }

  return channel.setRateLimitPerUser(newSlowmodeSeconds)
    .then(() => client.success(message.channel, 'Successfully Set New Slowmode!', `I've successfully set the slowmode of ${channel} to **${newSlowmodeSeconds} seconds!**`))
    .catch(() => client.error(message.channel, 'Failed to Set Slowmode!', `I've failed to set the slowmode for ${channel}! Make sure the new slowmode you provide is in seconds!`));
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['sm', 'slow', 'slm'],
  permLevel: 'Head Mod',
  args: 1,
};

module.exports.help = {
  name: 'slowmode',
  category: 'moderation',
  description: "Sets the mentioned channel's slowmode to the provided number of seconds",
  usage: 'slowmode <#channel> <new slowmode>',
  details: '<#channel> => The channel to adjust the slowmode for. If no channel is mentioned, falls back to the current channel.\n<new slowmode> => The new slowmode to apply to the channel (IN SECONDS).',
};
