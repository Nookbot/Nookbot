const moment = require('moment');
const schedule = require('node-schedule');

// eslint-disable-next-line consistent-return
module.exports.run = (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const time = args.find((arg) => client.timeRegex.test(arg));
  if (!time) {
    return client.error(message.channel, 'No Time Argument!', 'Please provide a valid amount of time! Ex. \`1d\`, \`3h\`, \`6m50s\`, etc.');
  }

  const msTime = client.stringToTime(time);
  if (msTime === null) {
    return client.error(message.channel, 'Invalid Time Argument!', 'Please provide a valid amount of time! Ex. \`1d\`, \`3h\`, \`6m50s\`, etc.');
  }

  const newTime = moment().add(msTime, 'ms');
  const newDate = newTime.toDate();

  const channel = message.mentions.channels.first() ? message.mentions.channels.first().id : 'DMs';
  const messageToSend = args.slice(channel === 'DMs' ? 1 : 2).join(' ');

  // eslint-disable-next-line no-underscore-dangle
  const _id = client.remindDB.autonum;
  client.remindDB.set(_id, {
    _id,
    member: message.author.id,
    date: newDate,
    channel,
    messageToSend,
  });

  schedule.scheduleJob(newDate, async () => {
    const text = `${client.emoji.clock} __**•• Reminder ••**__\n${message.author} ${messageToSend}`;
    try {
      if (channel === 'DMs') {
        const dmChannel = await message.member.createDM();
        await dmChannel.send(text);
      } else {
        await client.channels.cache.get(channel).send(text);
      }
    } catch (e) {
      console.error(e);
    }

    client.remindDB.delete(_id);
  });

  client.success(message.channel, 'Reminder Set!', `I'll remind you in \`${time}\` to **${messageToSend}**.`);
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['remindme'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'remind',
  category: 'misc',
  description: 'Remind the user of whatever specified.',
  usage: 'remind <time> <channel> <message>',
  details: "<time> => Valid amount of time. '1d', '3h', '6m50s', etc.\n<channel> => The channel to send the message to. If no channel is specified, message is sent to the user's DMs.\n<message> => The message to send to the user.",
};
