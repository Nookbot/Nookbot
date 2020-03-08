const moment = require('moment');

module.exports.run = async (client, message, args, level) => {
  let member;
  if (args.length > 0 && level >= 2) {
    // Mods can see other's infractions
    member = message.mentions.members.first();
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
  let msg = `__**${member.guild ? member.user.tag : `${member.username}#${member.discriminator}`}'s Bee Stings**__`;
  let expPoints = 0;
  let expMsg = '';
  let curPoints = 0;
  let curMsg = '';
  const time = Date.now();
  infractions.forEach((i) => {
    // Only allow mods to see zero point stings, called notes, on a user
    if (i.points > 0 || level >= 2) {
      if ((i.points * 604800000) + i.date > time) {
        curPoints += i.points;
        curMsg += `\n• Case ${i.case} (${moment.utc(i.date).format('DD MMM YY HH:mm')} UTC) ${i.points} bee sting${i.points === 1 ? '' : 's'}\n> Reason: ${i.reason}`;
      } else {
        expPoints += i.points;
        expMsg += `\n• Case ${i.case} (${moment.utc(i.date).format('DD MMM YY HH:mm')} UTC) ${i.points} bee sting${i.points === 1 ? '' : 's'}\n> Reason: ${i.reason}`;
      }
    }
  });

  if (curMsg) {
    msg += `\n**Current bee stings (${curPoints} total):**${curMsg}`;
  }
  if (expMsg) {
    msg += `\n**Expired bee stings (${expPoints} total):**${expMsg}`;
  }

  // Where to send message
  if (args.length > 0 && level >= 2) {
    if (curMsg || expMsg) {
      return message.channel.send(msg, { split: true });
    }
    // No infractions
    return message.channel.send(`${member.guild ? member.user.tag : `${member.username}#${member.discriminator}`} doesn't have any bee stings!`);
  }
  // Try to send DM
  try {
    const dmChannel = await member.createDM();
    if (curMsg || expMsg) {
      return await dmChannel.send(msg, { split: true });
    }
    return await dmChannel.send('You do not have any bee stings!');
  } catch (e) {
    // Send basic version in channel
    if (curMsg || expMsg) {
      return message.channel.send(`I was unable to send a detailed list of your bee stings to your direct messages, so here is some basic info:
**Current bee stings**: ${curPoints} sting${curPoints === 1 ? '' : 's'}
**Expired bee stings**: ${expPoints} sting${expPoints === 1 ? '' : 's'}`);
    }
    return message.channel.send('You do not have any bee stings!');
  }
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['beelog', 'bslog', 'stinglog'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'beestinglog',
  category: 'moderation',
  description: 'Shows a list of bee stings given to a member',
  usage: 'beestinglog <@member>',
  details: '<@member> The member to list bee stings for.',
};
