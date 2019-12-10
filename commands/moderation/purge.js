// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  // Gets the delete count
  const deleteCount = parseInt(args[0], 10);

  await message.delete();
  // If delete count is nonexistent, less than 1 or greater than 100, display this
  if (!deleteCount || deleteCount < 1 || deleteCount > 100) {
    return client.error(message.channel, 'Invalid Number of Messages to Purge!', 'Please provide a number **between 1 and 100** for the number of messages to delete!');
  }

  const descision = await client.reactPrompt(message, `Would you like to delete ${deleteCount} messages from <#${message.channel.id}>?`);

  if (descision) {
    return message.channel.bulkDelete(deleteCount)
      .catch((error) => client.error(message.channel, 'Purge Failed!', `Couldn't delete messages because: \`${error}\``));
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
  details: "<number> => From 1-100. I wish it could be more but Discord's API doesn't allow that...",
};
