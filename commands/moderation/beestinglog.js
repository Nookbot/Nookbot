// eslint-disable-next-line consistent-return
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

    // If no user mentioned, display this
    if (!member) {
      return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
    }
  } else {
    member = message.author;
  }

  const time = Date.now();
  const { infractions } = client.userDB.ensure(member.id, client.config.userDBDefaults);
  let msg = `__**${member.guild ? member.user.tag : `${member.username}#${member.discriminator}`}'s Bee Stings**__`;
  let expPoints = 0;
  let expMsg = '';
  let curPoints = 0;
  let curMsg = '';

  infractions.forEach((i) => {
    // Only allow mods to see zero point stings, called notes, on a user
    if (i.points > 0 || level >= 2) {
      const moderator = client.users.cache.get(i.moderator);
      const timestamp = Math.floor(new Date(i.date).getTime() / 1000);
      if ((i.points * 604800000) + i.date > time) {
        curPoints += i.points;
        curMsg += `\n• Case ${i.case} -${level >= 2 ? ` ${moderator ? `Mod: ${moderator.tag}` : `Unknown Mod ID: ${i.moderator || 'No ID Stored'}`} -` : ''} (<t:${timestamp}:F>; <t:${timestamp}:R>) ${i.points} bee sting${i.points === 1 ? '' : 's'}\n> Reason: ${i.reason}`;
      } else {
        expPoints += i.points;
        expMsg += `\n• Case ${i.case} -${level >= 2 ? ` ${moderator ? `Mod: ${moderator.tag}` : `Unknown Mod ID: ${i.moderator || 'No ID Stored'}`} -` : ''} (<t:${timestamp}:F>; <t:${timestamp}:R>) ${i.points} bee sting${i.points === 1 ? '' : 's'}\n> Reason: ${i.reason}`;
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
      await dmChannel.send(msg, { split: true });
    } else {
      await dmChannel.send('You do not have any bee stings!');
    }
    if (message.channel.type !== 'dm') {
      return message.channel.send("I've sent you a DM!");
    }
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
  aliases: ['beelog', 'bslog', 'stinglog', 'bl'],
  permLevel: 'User',
  allowedChannels: [
    '744634458283442236', // head staff
    '495899336664809492', // resident services
    '858900696555847721', // trainee
    '744633499033534504', // applications
    '625186314253238272', // logs
  ],
};

module.exports.help = {
  name: 'beestinglog',
  category: 'moderation',
  description: 'Shows a list of bee stings given to a member',
  usage: 'beestinglog <member id>',
  details: '<member id> => The id of the member to list bee stings for.',
};
