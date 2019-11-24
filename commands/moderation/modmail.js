// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  const initMsg = `Hello **${message.author.username}!** You've initiated Mod Mail communication! I'll direct your next message to the staff channel so go ahead, I'm listening!`;
  const dmCh = await message.author.createDM();

  // #staff-discussion but the name might change so the id is best
  const staffCh = client.guilds.first().channels.get('588480202338861107');

  if (args.length == 0) {
    if (message.guild) {
      dmCh.send(initMsg)
        .then(message.channel.send("I've sent you a DM!"))
        .catch((err) => {
          client.error(message.channel, 'Error!', 'Failed to send a DM to you! Do you have DMs off?');
          console.error(err);
        });
    } else if (message.channel.type === 'dm') {
      await dmCh.send(initMsg);
    }

    const filter = (m) => !m.author.bot;
    await dmCh.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
      .then(async (collected) => {
        await staffCh.send(`**${message.author.tag}** (${message.author}) : ${collected.first().content}`);
        await client.success(dmCh, 'Sent!', 'Pete has delivered your message safely to the Town Hall!');
      })
      .catch(() => {
        client.error(dmCh, "Time's Up!", "Time has expired! You'll have to run the command again if you want to send a message to the staff!");
      });
  } else {
    // Remove the message from the guild chat as it may contain sensitive information.
    if (message.guild) message.delete().catch((err) => console.error(err));
    await staffCh.send(`**${message.author.tag}** (${message.author}) : ${args.join(' ')}`);
    await client.success(message.channel, 'Sent!', 'Pete has delivered your message safely to the Town Hall!')
  }
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['mod', 'mail', 'mm'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'modmail',
  category: 'moderation',
  description: 'Sends the provided message to the staff channel',
  usage: 'modmail <message>',
  details: 'message => Anything you wish to report to the staff team',
};
