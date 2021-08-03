const Discord = require('discord.js');

// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level) => {
  let user;
  if (parseInt(args[0], 10)) {
    try {
      user = await client.users.fetch(args[0]);
    } catch (err) {
      // Nothing to do here
    }
  }

  if (!user) {
    if (level >= 6) {
      const feedbackMessage = await message.channel.messages.fetch(args[1]);
      if (!feedbackMessage || !feedbackMessage.embeds[0]) {
        return client.error(message.channel, 'Invalid Message ID!', 'Please provide a valid message id of the feedback you wish to send!');
      }

      const originalEmbed = feedbackMessage.embeds[0];
      const recipient = await client.users.fetch(originalEmbed.footer.text.split('-')[1].trim());

      const sendFeedback = async (feedback) => {
        const confirmPrompt = await message.channel.send(`Are you sure you want to send **${recipient.tag}** the following feedback?\n\`\`\`\n${feedback}\`\`\``);
        await confirmPrompt.react(client.emoji.checkMark);
        await confirmPrompt.react(client.emoji.redX);

        const filter = (reaction, userReacted) => [client.emoji.checkMark, client.emoji.redX].includes(reaction.emoji.name)
            && userReacted.id === message.author.id;

        let decision = false;
        await confirmPrompt.awaitReactions(filter, { max: 1, time: 1200000, errors: ['time'] })
          .then((collected) => {
            if (collected.first().emoji.name === client.emoji.checkMark) {
              decision = true;
            }
          })
          .catch(() => client.error(message.channel, 'Confirmation Prompt Timed Out!', 'Please rerun the command to attempt to send feedback again!'));

        if (decision) {
          // Try to send dm to recipient
          try {
            const dmChannelRecip = await recipient.createDM();
            const newEmbed = new Discord.MessageEmbed()
              .setColor('RANDOM')
              .setTimestamp()
              .setTitle("You've Been Sent Feedback!")
              .setDescription(feedback);

            await dmChannelRecip.send(newEmbed);
            client.success(message.channel, 'Feedback Sent!', `I've successfully sent **${recipient.tag}** feedback!`);
          } catch (e) {
            return client.error(message.channel, 'Failed to Send DM!', "I've failed to send the requested feedback! The recipient may have DMs off!");
          }

          // try to send dm to original sender
          try {
            const originalSender = await client.users.fetch(originalEmbed.footer.text.split('-')[0].trim());
            const dmChannelOriginal = await originalSender.createDM();

            return client.success(dmChannelOriginal, 'Feedback Confirmed and Sent!', `Your feedback for **${recipient.tag}** was confirmed and sent successfully!`);
          } catch (e) {
            return console.error(e);
          }
        } else {
          return client.error(message.channel, 'Not Sending Feedback!', `Feedback was not sent to **${recipient.tag}**!`);
        }
      };

      switch (args[0]) {
        case 'send':
        case 's':
          await sendFeedback(originalEmbed.description);
          break;
        case 'edit':
        case 'e':
          await sendFeedback(args.slice(2).join(' '));
          break;
        default:
          client.error(message.channel, 'Invalid Operator!', 'Please specify whether to edit (e) or send (s) the requested feedback!');
          break;
      }
    } else {
      return client.error(message.channel, 'Invalid Member', 'Please mention a valid member of the server!');
    }
  } else {
    if (message.channel.type !== 'dm') {
      await message.delete();
      return client.error(message.channel, 'DM Only Command!', 'This command can only be used in DMs!');
    }

    if (!args[1]) {
      return client.error(message.channel, 'No Feedback Provided!', `You did not provide any feedback to give to **${user.tag}**!`);
    }

    const feedbackMsg = args.slice(1).join(' ');
    const feedbackCh = client.channels.cache.get('871526192707141653');
    const { displayColor } = await client.guilds.cache.get(client.config.mainGuild).members.fetch(user.id);

    const feedbackEmbed = new Discord.MessageEmbed()
      .setColor(displayColor)
      .setTimestamp()
      .setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))
      .setTitle(`From ${message.author.tag} to ${user.tag}`)
      .setDescription(feedbackMsg)
      .setFooter(`${message.author.id} - ${user.id}`);

    await feedbackCh.send(feedbackEmbed);
    return client.success(message.channel, 'Successfully Sent Feedback!', `I've successfully sent your feedback to head staff to view! **${user.tag}** should be receiving it soon!`);
  }
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['fb'],
  args: 2,
  permLevel: 'Copper & Booker',
};

module.exports.help = {
  name: 'feedback',
  category: 'misc',
  description: 'Give positive feedback to other staff members anonymously.',
  usage: 'feedback <id> <message>',
  details: '<id> => The id of the staff member to give feedback to.\n<message> => The feedback to give.',
};
