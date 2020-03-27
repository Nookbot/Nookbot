// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  // #staff-discussion but the name might change so the id is best
  const modMailCh = client.guilds.cache.first().channels.cache.get(client.config.reportMail);

  if (args.length === 0) {
    const initMsg = `Hello **${message.author.username}!** You've initiated Report communication! I'll direct your next message to the staff channel so go ahead, I'm listening!`;
    const dmCh = await message.author.createDM();
    if (message.guild) {
      message.delete().catch((err) => console.error(err));
      dmCh.send(initMsg)
        .then(() => message.channel.send("I've sent you a DM!"))
        .catch((err) => {
          client.error(message.channel, 'Error!', 'Failed to send a DM to you! Do you have DMs off?');
          return console.error(err);
        });
    } else if (message.channel.type === 'dm') {
      await dmCh.send(initMsg);
    }

    const filter = (m) => !m.author.bot;
    await dmCh.awaitMessages(filter, { max: 1, time: 180000, errors: ['time'] })
      .then(async (collected) => {
        const attachments = collected.first().attachments.map((a) => a.url);
        await modMailCh.send(`**${message.author.tag}** (${message.author}) : ${collected.first().content}`, { split: true, files: attachments });
        await client.success(dmCh, 'Sent!', 'Orville has successfully sent your report to Resident Services!');
      })
      .catch(() => {
        client.error(dmCh, "Time's Up!", "Time has expired! You'll have to run the command again if you want to send a report to the staff!");
      });
  } else {
    const attachments = message.attachments.map((a) => a.url);
    await modMailCh.send(`**${message.author.tag}** (${message.author}) : ${args.join(' ')}`, { split: true, files: attachments });
    // Remove the message from the guild chat as it may contain sensitive information.
    if (message.guild) {
      message.delete().catch((err) => console.error(err));
    }
    await client.success(message.channel, 'Sent!', 'Orville has successfully sent your report to Resident Services!');
  }
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['rep', 'scam', 'scammer'],
  permLevel: 'User',
  cooldown: 60,
};

module.exports.help = {
  name: 'report',
  category: 'moderation',
  description: 'Report a member for scamming to the staff',
  usage: 'report <message>',
  details: 'message => Anything you wish to report to the staff team',
};
