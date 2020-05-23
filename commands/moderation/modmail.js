// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level, Discord) => {
  const modMailCh = client.guilds.cache.first().channels.cache.get(client.config.modMail);

  if (message.channel.id === client.config.modMail) {
    // This was sent in the staff channel, so they are trying to reply to modmail.
    let member = message.mentions.members.first();
    if (!member) {
      if (parseInt(args[0], 10)) {
        try {
          member = await client.users.fetch(args[0]);
        } catch (err) {
          // Don't need to send a message here
        }
      }
    }

    if (!member) {
      client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
      return;
    }

    try {
      const dmCh = await member.createDM();
      const attachments = message.attachments.map((a) => a.url);

      await dmCh.send(`__**Mod Mail Response**__\n**${message.author.tag}** (${message.author.id}) : ${args.slice(1).join(' ')}`, { split: true, files: attachments });
      client.success(message.channel, 'Mod Mail Response Sent!', `I've successfully sent your response to **${member.guild ? member.user.tag : member.tag || member}**!`);
      return;
    } catch (err) {
      client.error(message.channel, 'Unable to DM that Member!', 'The user must have their DMs closed or is otherwise unavailable.');
      return;
    }
  }

  if (args.length === 0) {
    const initMsg = `Hello **${message.author.username}!** You've initiated Mod Mail communication! I'll direct your next message to the staff channel so go ahead, I'm listening!`;
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
        const embed = new Discord.MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
          .setColor('#1DE9B6')
          .setDescription(collected.first().content)
          .setFooter(`.mm ${message.author.id}`);
        modMailCh.send(`${message.author}`, { embed, files: attachments })
          .then(() => {
            client.success(dmCh, 'Sent!', 'Orville has successfully sent your postcard to Resident Services!');
          })
          .catch(() => {
            client.error(dmCh, 'Not Sent!', 'Orville had difficulties sending your postcard to Resident Services!');
          });
      })
      .catch(() => {
        client.error(dmCh, "Time's Up!", "Time has expired! You'll have to run the command again if you want to send a message to the staff!");
      });
  } else {
    const attachments = message.attachments.map((a) => a.url);
    const embed = new Discord.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setColor('#1DE9B6')
      .setDescription(args.join(' '))
      .setFooter(`.mm ${message.author.id}`);
    modMailCh.send(`${message.author}`, { embed, files: attachments })
      .then(() => {
        // Remove the message from the guild chat as it may contain sensitive information.
        if (message.guild) {
          message.delete().catch((err) => console.error(err));
        }
        client.success(message.channel, 'Sent!', 'Orville has successfully sent your postcard to Resident Services!');
      })
      .catch(() => {
        // Remove the message from the guild chat as it may contain sensitive information.
        if (message.guild) {
          message.delete().catch((err) => console.error(err));
        }
        client.error(message.channel, 'Not Sent!', 'Orville had difficulties sending your postcard to Resident Services!');
      });
  }
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['mod', 'mail', 'mm'],
  permLevel: 'User',
  cooldown: 60,
};

module.exports.help = {
  name: 'modmail',
  category: 'moderation',
  description: 'Sends the provided message to the staff channel',
  usage: 'modmail <message>',
  details: 'message => Anything you wish to report to the staff team',
};
