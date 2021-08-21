const Discord = require('discord.js');

// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  // If the channel is not a dm, send an error message
  if (message.channel.type !== 'dm') {
    // Delete the message for privacy reasons
    await message.delete();
    // Send the error
    return client.error(message.channel, 'DM Only Command!', 'This command can only be used in DMs!');
  }

  // String together the message to send to head staff
  const anonMsg = args.join(' ');
  // Get the feedback channel to send the message to
  const feedbackCh = client.channels.cache.get('871526192707141653');

  // Build the embed that will contain the message
  const anonEmbed = new Discord.MessageEmbed()
    // Set the color of the embed to the default grey
    .setColor()
    // Set the timestamp of the embed to now
    .setTimestamp()
    // Set the description of the embed to the message to send
    .setDescription(anonMsg);

  // Send the embed containing the message to head staff
  await feedbackCh.send(anonEmbed);
  // Send a message confirming the message was sent
  return client.success(message.channel, 'Successfully Sent Anonymous Message!', "I've successfully sent your message to head staff anonymously. You will not be connected to the message in any way.");
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['anon'],
  args: 1,
  permLevel: 'Copper & Booker',
};

module.exports.help = {
  name: 'anonymous',
  category: 'misc',
  description: 'Send anonymous message to head staff.',
  usage: 'anonymous <message>',
  details: '<message> => The message to send anonymously.',
};
