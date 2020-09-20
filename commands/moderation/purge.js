// eslint-disable-next-line no-unused-vars

// Simple sleep function (for discord ratelimits)
function sleep(seconds) {
  milliseconds = seconds*1000;
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

module.exports.run = async (client, message, args, level) => {
  // Gets the delete count
  const deleteCount = parseInt(args[0], 10);

  await message.delete();
  // If delete count is nonexistent or less than 1, display this
  if (!deleteCount || deleteCount < 1) {
    return client.error(message.channel, 'Invalid Number of Messages to Purge!', 'Please provide a number for the number of messages to delete!');
  }

  const descision = await client.reactPrompt(message, `Would you like to delete ${deleteCount} messages from <#${message.channel.id}>?`);

  if (descision) {
    for(var i = 0; i >= deleteCount; i++) {
       message.channel.bulkDelete(deleteCount).catch((error) => client.error(message.channel, 'Purge Failed!', `Couldn't delete messages because: \`${error}\``));
       sleep(0.2); // No more ratelimits pls.
    };
  }
  return client.error(message.channel, 'Messages Not Purged!', 'The prompt timed out, or you selected no.');
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['p'],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'purge',
  category: 'moderation',
  description: 'Purges the stated number of messages in a channel',
  usage: 'purge <number>',
  details: "<number> => Any number of messages to purge",
};
