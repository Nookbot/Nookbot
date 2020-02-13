module.exports.run = async (client, message, args, level, Discord) => {
  let member = message.mentions.members.first();
  if (!member) {
    member = parseInt(args[0], 10) ? await message.guild.fetchMember(args[0]) : undefined;
  }

  if (!member) {
    const searchedMember = client.searchMember(args[0]);
    if (searchedMember) {
      const decision = await client.reactPrompt(message, `Would you like to give \`${searchedMember.user.tag}\` an infraction?`);
      if (decision) {
        member = searchedMember;
      } else {
        message.delete().catch((err) => console.error(err));
        return client.error(message.channel, 'Infraction Not Given!', 'The prompt timed out, or you selected no.');
      }
    }
  }

  // If no user mentioned, display this
  if (!member) {
    return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
  }

  const newPoints = parseInt(args[1], 10);

  if (!newPoints) {
    return client.error(message.channel, 'Invalid Number!', 'Please provide a valid number for the points to give!');
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
  if (newPoints + curPoints >= 25) {
    // Ban
    dmMsg = `You have been banned from the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} infraction point${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
If you wish to appeal your ban, fill out this Google Form:
<https://forms.gle/jcoP8kd3My31x3Gu6>`;
    action = 'Ban';
    ban = true;
  } else if (curPoints < 20 && newPoints + curPoints >= 20) {
    // Mute 12 hours
    dmMsg = `You have been temporarily muted for 12 hours in the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} infraction point${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
If you wish to contact the moderators about your mute, please use the \`.modmail <message>\` command in this DM.`;
    action = '12 Hour Mute';
    mute = 720;
  } else if (curPoints < 15 && newPoints + curPoints >= 15) {
    // Mute 1 hour
    dmMsg = `You have been temporarily muted for 1 hour in the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} infraction point${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
If you wish to contact the moderators about your mute, please use the \`.modmail <message>\` command in this DM.`;
    action = '1 Hour Mute';
    mute = 60;
  } else if (curPoints < 10 && newPoints + curPoints >= 10) {
    // Mute 30 minutes
    dmMsg = `You have been temporarily muted for 30 minutes in the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} infraction point${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
If you wish to contact the moderators about your mute, please use the \`.modmail <message>\` command in this DM.`;
    action = '30 Minute Mute';
    mute = 30;
  } else if (curPoints < 5 && newPoints + curPoints >= 5) {
    // Mute 10 minutes
    dmMsg = `You have been temporarily muted for 10 minutes in the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} infraction point${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
If you wish to contact the moderators about your mute, please use the \`.modmail <message>\` command in this DM.`;
    action = '10 Minute Mute';
    mute = 10;
  } else {
    // Give warning
    dmMsg = `You have been warned in the AC:NH server for the following reason:
**${reason}**
You were given **${newPoints} infraction point${newPoints === 1 ? '' : 's'}** and your total is **${newPoints + curPoints}**.
If you wish to contact the moderators about your warning, please use the \`.modmail <message>\` command in this DM.`;
    action = 'Warn';
  }

  // Try to send DM
  let dmSent = false;
  try {
    const dmChannel = await member.createDM();
    await dmChannel.send(dmMsg);
    dmSent = true;
  } catch (e) {
    // Nothing to do here
  }

  // Create infraction in the infractionDB to get case number
  const caseNum = client.infractionDB.autonum;
  client.infractionDB.set(caseNum, member.id);

  // Create infraction in the userDB to store important information
  client.userDB.push(member.id, {
    case: caseNum,
    action,
    points: newPoints,
    reason,
    moderator: message.author.id,
    dmSent,
    date: time,
  }, 'infractions', true);

  // Perform the required action
  if (ban) {
    member.ban({ reason }).catch((err) => {
      client.error(message.guild.channels.get(client.getSettings(message.guild).modLog), 'Ban Failed!', `I've failed to ban this member! ${err}`);
    });
  } else if (mute) {
    member.addRole('495854925054607381', reason).catch((err) => {
      client.error(message.guild.channels.get(client.getSettings(message.guild).modLog), 'Mute Failed!', `I've failed to mute this member! ${err}`);
    });
    // Schedule unmute
    setTimeout(() => {
      member.removeRole('495854925054607381', `Scheduled unmute after ${mute} minutes.`).catch((err) => {
        client.error(message.guild.channels.get(client.getSettings(message.guild).modLog), 'Unmute Failed!', `I've failed to unmute this member! ${err}`);
      });
    }, mute * 60000);
  }

  // Notify in channel
  client.success(message.channel, 'Infraction Given!', `**${member.user.tag}** was given **${newPoints} infraction point${newPoints === 1 ? '' : 's'}!**`)

  // Send mod-log embed
  const embed = new Discord.RichEmbed()
    .setAuthor(`Case ${caseNum} | ${action} | ${member.user.tag}`, member.user.displayAvatarURL)
    .setColor((mute || ban) ? '#ff9292' : '#fada5e')
    .setDescription(`Reason: ${reason}`)
    .addField('User', `<@${member.id}>`, true)
    .addField('Moderator', `<@${message.author.id}>`, true)
    .addField('Points Given', newPoints, true)
    .addField('DM Sent?', dmSent ? client.emoji.checkMark : client.emoji.redX, true)
    .addField('Total Points', curPoints + newPoints, true)
    .setFooter(`ID: ${member.id}`)
    .setTimestamp();
  return message.guild.channels.get(client.getSettings(message.guild).modLog).send(embed);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['inf', 'infractions', 'points', 'pts'],
  permLevel: 'Mod',
  args: 2,
};

module.exports.help = {
  name: 'infraction',
  category: 'moderation',
  description: 'Manage infractions on server members.',
  usage: 'infraction <@member> <points> <reason>',
  details: '<@member> The member to give an infraction.\n<points> => The number of points to give the member.\n<reason> => The reason for giving the member the infraction.',
};
