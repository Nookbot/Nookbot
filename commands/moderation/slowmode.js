/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  const channel = message.mentions.channels.first() || message.channel;
  if (!channel.permissionsFor(message.guild.me).has('MANAGE_CHANNELS')) {
    return client.error(message.channel, 'No Permission!', "I don't have permission to edit the slowmode for that channel!");
  }

  const newSlowmodeArg = args.find((arg) => client.timeRegex.test(arg));
  if (!newSlowmodeArg) {
    return client.error(message.channel, 'No Slowmode Argument!', 'Please provide a valid amount of time to set the slowmode to!');
  }

  const newSlowmodeMS = client.stringToTime(newSlowmodeArg);
  if (newSlowmodeMS === null) {
    return client.error(message.channel, 'Invalid Slowmode Argument!', 'Please provide a valid amount of time to set the slowmode to!');
  }

  const newSlowmode = newSlowmodeMS / 1000;

  if (newSlowmode > 21600) {
    return client.error(message.channel, 'Slowmode Argument Too High!', 'You cannot have the slowmode surpass 6 hours!');
  }

  return channel.setRateLimitPerUser(newSlowmode)
    .then(() => client.success(message.channel, 'Successfully Set New Slowmode!', `I've successfully set the slowmode of ${channel} to **${client.humanTimeBetween(newSlowmodeMS, 0)}!**`))
    .catch(() => client.error(message.channel, 'Failed to Set Slowmode!', `I've failed to set the slowmode for ${channel}!`));
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['sm', 'slow', 'slm'],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'slowmode',
  category: 'moderation',
  description: "Sets the mentioned channel's slowmode to the provided number of seconds",
  usage: 'slowmode <#channel> <new slowmode>',
  details: '<#channel> => The channel to adjust the slowmode for. If no channel is mentioned, falls back to the current channel.\n<new slowmode> => The new slowmode to apply to the channel. Can be in seconds (s) or minutes (m). If no tag, default is seconds Ex. 2m, 60, 37s, 1m30s, etc.',
};
