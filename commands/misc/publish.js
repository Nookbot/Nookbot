// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  let msg;
  if (parseInt(args[0], 10)) {
    const newsChannels = message.guild.channels.cache.filter((ch) => ch.type === 'GUILD_NEWS');

    for (let i = 0; i < newsChannels.size; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        msg = await newsChannels.first(i).messages.fetch(args[0]);
      } catch (err) {
        // Nothing to do here. Just continue with the next iteration.
      }
    }
  }

  if (!msg) {
    return client.error(message.channel, 'Invalid ID!', 'Please provide a valid message id from a news channel to crosspost!');
  }

  return msg.crosspost().catch((err) => {
    client.error(message.channel, 'Corsspost Failed!', "I've failed to crosspost this message!");
    console.error(err);
  });
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['push', 'pub', 'cross', 'crosspost', 'post'],
  args: 1,
  permLevel: 'Head Mod',
};

module.exports.help = {
  name: 'publish',
  category: 'misc',
  description: 'Publishes the provided message id to the servers following its respective news channel.',
  usage: 'publish <message id>',
  details: '<message id> => The message id of a message in a news channel to be crossposted.',
};
