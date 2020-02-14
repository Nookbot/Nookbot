const moment = require('moment');

module.exports.run = async (client, message, args, level) => {
  let member;
  if (args.length > 0 && level >= 2) {
    // Mods can see other's infractions
    member = message.mentions.members.first();
    if (!member) {
      member = parseInt(args[0], 10) ? await client.fetchUser(args[0]) : undefined;
    }
    if (!member) {
      member = client.searchMember(args[0]);
    }

    // If no user mentioned, display this
    if (!member) {
      return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
    }
  } else {
    member = message.author;
  }

  const { infractions } = client.userDB.ensure(member.id, client.config.userDBDefaults);
  let msg = `__**${member.guild ? member.user.tag : `${member.username}#${member.discriminator}`}'s Infractions**__`;
  let expPoints = 0;
  let expMsg = '';
  let curPoints = 0;
  let curMsg = '';
  const time = Date.now();
  infractions.forEach((i) => {
    if ((i.points * 604800000) + i.date > time) {
      curPoints += i.points;
      curMsg += `\n• Case ${i.case} (${moment.utc(i.date).format('DD MMM YY HH:mm')} UTC) ${i.points} point${i.points === 1 ? '' : 's'}\n> Reason: ${i.reason}`;
    } else {
      expPoints += i.points;
      expMsg += `\n• Case ${i.case} (${moment.utc(i.date).format('DD MMM YY HH:mm')} UTC) ${i.points} point${i.points === 1 ? '' : 's'}\n> Reason: ${i.reason}`;
    }
  });

  if (curMsg) {
    msg += `\n**Current infractions (${curPoints} total):**${curMsg}`;
  }
  if (expMsg) {
    msg += `\n**Expired infractions (${expPoints} total):**${expMsg}`;
  }

  // Where to send message
  if (args.length > 0 && level >= 2) {
    if (curMsg || expMsg) {
      return message.channel.send(msg, { split: true });
    }
    // No infractions
    return message.channel.send(`${member.guild ? member.user.tag : `${member.username}#${member.discriminator}`} doesn't have any infractions!`);
  }
  // Try to send DM
  try {
    const dmChannel = await member.createDM();
    if (curMsg || expMsg) {
      return await dmChannel.send(msg, { split: true });
    }
    return await dmChannel.send('You do not have any infractions!');
  } catch (e) {
    // Send basic version in channel
    if (curMsg || expMsg) {
      return message.channel.send(`I was unable to send a detailed list of your infractions to your direct messages, so here is some basic info:
**Current infractions**: ${curPoints} point${curPoints === 1 ? '' : 's'}
**Expired infractions**: ${expPoints} point${expPoints === 1 ? '' : 's'}`);
    }
    return message.channel.send('You do not have any infractions!');
  }
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['inflog', 'infractionslog', 'pointslog', 'ptslog'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'infractionlog',
  category: 'moderation',
  description: 'Shows a list of infractions given to a member',
  usage: 'infraction <@member>',
  details: '<@member> The member to list infractions for.',
};
