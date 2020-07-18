module.exports.run = async (client, message, args, level, Discord) => {
  let member;
  if (parseInt(args[0], 10)) {
    try {
      member = await client.users.fetch(args[0]);
    } catch (err) {
      // Don't need to send a message here
    }
  }

  if (!member) {
    member = message.mentions.members.first();
  }

  // If no user mentioned, display this
  if (!member) {
    return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
  }

  const newPoints = parseInt(args[1], 10);

  if (!(newPoints >= 0)) {
    return client.error(message.channel, 'Invalid Number!', 'Please provide a valid number for the stings to give!');
  }

  const reason = args[2] ? args.slice(2).join(' ') : 'No reason given.';

  let curPoints = 0;
  const time = Date.now();
  client.userDB.ensure(member.id, client.config.userDBDefaults).infractions.forEach((i) => {
    // If (points * 1 week) + time of infraction > current time, then the points are still valid
    if ((i.points * 604800000) + i.date > time) {
      curPoints += i.points;
    }
  });

  let dmMsg;
  let action;
  let mute = 0;
  let ban = false;
  if (newPoints === 0) {
    // Make a note
    action = 'Note';
  } else if (newPoints + curPoints >= 25) {
    // Ban
    dmMsg = `You have been banned from the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} bee sting${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
If you wish to appeal your ban, fill out this Google Form:
${client.config.banAppealLink}`;
    action = 'Ban';
    ban = true;
  } else if (curPoints < 20 && newPoints + curPoints >= 20) {
    // Mute 12 hours
    dmMsg = `You have been temporarily muted and will be unable to see any trade channels for 12 hours in the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} bee sting${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
If you previously had the Trade or Voice roles, you will need to reread the rules and rereact to the verification prompt to obtain them again.
For more information about why you were muted, please read #rules-you-must-read (<#696239787467604008>).`;
    action = '12 Hour Mute';
    mute = 720;
  } else if (curPoints < 15 && newPoints + curPoints >= 15) {
    // Mute 1 hour
    dmMsg = `You have been temporarily muted and will be unable to see any trade channels for 1 hour in the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} bee sting${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
If you previously had the Trade or Voice roles, you will need to reread the rules and rereact to the verification prompt to obtain them again.
For more information about why you were muted, please read #rules-you-must-read (<#696239787467604008>).`;
    action = '1 Hour Mute';
    mute = 60;
  } else if (curPoints < 10 && newPoints + curPoints >= 10) {
    // Mute 30 minutes
    dmMsg = `You have been temporarily muted and will be unable to see any trade channels for 30 minutes in the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} bee sting${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
If you previously had the Trade or Voice roles, you will need to reread the rules and rereact to the verification prompt to obtain them again.
For more information about why you were muted, please read #rules-you-must-read (<#696239787467604008>).`;
    action = '30 Minute Mute';
    mute = 30;
  } else if (curPoints < 5 && newPoints + curPoints >= 5) {
    // Mute 10 minutes
    dmMsg = `You have been temporarily muted and will be unable to see any trade channels for 10 minutes in the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} bee sting${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
If you previously had the Trade or Voice roles, you will need to reread the rules and rereact to the verification prompt to obtain them again.
For more information about why you were muted, please read #rules-you-must-read (<#696239787467604008>).`;
    action = '10 Minute Mute';
    mute = 10;
  } else {
    // Give warning
    dmMsg = `You have been warned in the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} bee sting${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
Don't worry, 1 sting is just a warning and will expire in **1 week**.
For more information about why you were warned, please read #rules-you-must-read (<#696239787467604008>).`;
    action = 'Warn';
  }

  let dmSent = false;
  if (newPoints > 0) {
    // Try to send DM
    try {
      const dmChannel = await member.createDM();
      await dmChannel.send(dmMsg);
      dmSent = true;
    } catch (e) {
      // Nothing to do here
    }
  }

  // Create infraction in the infractionDB to get case number
  const caseNum = client.infractionDB.autonum;
  client.infractionDB.set(caseNum, member.id);

  // Create infraction in the userDB to store important information
  client.userDB.push(member.id, {
    case: caseNum,
    action,
    points: newPoints,
    reason: `${reason}${message.attachments.size > 0 ? `\n${message.attachments.map((a) => `${a.url}`).join('\n')}` : ''}`,
    moderator: message.author.id,
    dmSent,
    date: time,
  }, 'infractions', true);

  // Perform the required action
  if (ban) {
    await client.guilds.cache.get(client.config.mainGuild).members.ban(member, { reason: '[Auto] Beestings', days: 1 }).catch((err) => {
      client.error(client.channels.cache.get(client.config.modLog), 'Ban Failed!', `I've failed to ban this member! ${err}`);
    });
  } else if (mute) {
    try {
      // Update unmuteTime on userDB
      client.muteDB.set(member.id, (mute * 60000) + time);
      const guildMember = await client.guilds.cache.get(client.config.mainGuild).members.fetch(member);
      const mutedMember = await guildMember.roles.add(client.config.mutedRole);
      await mutedMember.roles.remove([client.config.tradeRole, client.config.voiceRole]);

      // Kick member from voice
      if (guildMember.voice.channel) {
        guildMember.voice.kick();
      }

      // Schedule unmute
      setTimeout(() => {
        if ((client.muteDB.get(member.id) || 0) < Date.now()) {
          client.muteDB.delete(member.id);
          mutedMember.roles.remove(client.config.mutedRole, `Scheduled unmute after ${mute} minutes.`).catch((err) => {
            client.error(client.channels.cache.get(client.config.modLog), 'Unmute Failed!', `I've failed to unmute this member! ${err}\nID: ${member.id}`);
          });
        }
      }, mute * 60000);
    } catch (err) {
      client.error(client.channels.cache.get(client.config.modLog), 'Mute Failed!', `I've failed to mute this member! ${err}`);
    }
  }

  // Notify in channel
  client.success(message.channel, 'Bee Sting Given!', `**${member.guild ? member.user.tag : member.tag || member}** was given **${newPoints}** bee sting${newPoints === 1 ? '' : 's'}!`);

  // Send mod-log embed
  const embed = new Discord.MessageEmbed()
    .setAuthor(`Case ${caseNum} | ${action} | ${member.guild ? member.user.tag : member.tag || member}`, member.guild ? member.user.displayAvatarURL() : member.displayAvatarURL())
    .setColor((mute || ban) ? '#ff9292' : '#fada5e')
    .setDescription(`Reason: ${reason}`)
    .addField('User', `<@${member.id}>`, true)
    .addField('Moderator', `<@${message.author.id}>`, true)
    .addField('Stings Given', newPoints, true)
    .addField('DM Sent?', dmSent ? `${client.emoji.checkMark} Yes` : `${client.emoji.redX} No`, true)
    .addField('Total Stings', curPoints + newPoints, true)
    .setFooter(`ID: ${member.id}`)
    .setTimestamp();
  return client.channels.cache.get(client.config.modLog).send(embed);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['bee', 'bs', 'sting'],
  permLevel: 'Redd',
  args: 2,
};

module.exports.help = {
  name: 'beesting',
  category: 'moderation',
  description: 'Manage bee stings on server members.',
  usage: 'beesting <@member> <stings> <reason>',
  details: '<@member> The member to give a bee sting.\n<stings> => The number of stings to give the member.\n<reason> => The reason for giving the member the bee sting.',
};
