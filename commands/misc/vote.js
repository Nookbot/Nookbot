// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  let msgToReact = message.channel.messages.cache.get(args[0]);

  // eslint-disable-next-line no-restricted-globals
  if (!msgToReact) {
    if (parseInt(args[0], 10)) {
      try {
        msgToReact = await message.channel.messages.fetch(args[0]);
      } catch (err) {
        return client.error(message.channel, 'No Message Found!', 'No message was found! Please use a valid message id from **THIS** channel!');
      }
    } else {
      return client.error(message.channel, 'Not a Message ID!', 'Please use this command with a valid message id from **THIS** channel!');
    }
  }

  await msgToReact.react(client.emoji.thumbsUp);
  await msgToReact.react(client.emoji.thumbsDown);
  await msgToReact.react(client.emoji.neutral);
  return message.delete({ timeout: 1000 });
};

module.exports.conf = {
  guildOnly: true,
  aliases: [],
  permLevel: 'User',
  args: 1,
};

module.exports.help = {
  name: 'vote',
  category: 'misc',
  description: 'Create a simple reaction vote with a provided message id',
  usage: 'vote <message id>',
  details: '<message id> => A valid message id from the channel the command is used in.',
};
