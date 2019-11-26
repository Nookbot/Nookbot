const Discord = require('discord.js');

module.exports = async (client, member) => {
  // Raid checking
  // Add this member to the list of raid joins.
  client.raidJoins.push(member);

  // If raidJoins has 10 members in it, that means we had 10 joins in less than 10 seconds
  // and we need to active Raid Mode.
  if (!client.raidMode && client.raidJoins.length >= 10) {
    // Enable Raid Mode
    client.raidMode = true;
    // Save @everyone role and staff/actionlog channels here for ease of use.
    const everyone = member.guild.defaultRole;
    const staffChat = member.guild.channels.get(client.getSettings(member.guild).staffChat);
    const actionLog = member.guild.channels.get(client.getSettings(member.guild).actionLog);
    // Create a Permissions object with the permissions of the @everyone role, but remove Send Messages.
    const perms = new Discord.Permissions(everyone.permissions).remove('SEND_MESSAGES');
    everyone.setPermissions(perms);
    // Send message to staff with prompts
    client.raidMessage = await staffChat.send(`**##### RAID MODE ACTIVATED #####**
<@&495865346591293443> <@&494448231036747777>
Would you like to ban all ${client.raidJoins.length} members that joined in the raid?
If you would like to remove any of the members from the list, use the \`.raidremove <ID>\` command.
A list of members that joined in the raid is being updated in <#630581732453908493>.
This message updates every 5 seconds, and you should wait to decide until the count stops increasing.`);
    await client.raidMessage.react(client.emoji.checkMark);
    await client.raidMessage.react(client.emoji.redX);
    // Listen for reactions and log which action was taken and who made the decision.
    const filter = (reaction, user) => [client.emoji.checkMark, client.emoji.redX].includes(reaction.emoji.name)
        && member.guild.fetchMember(user).hasPermission('BAN_MEMBERS');
    client.raidMessage.awaitReactions(filter, { max: 1 })
      .then(async (collected) => {
        const reaction = collected.first();
        const modUser = reaction.users.first();
        if (reaction.emoji.name === client.emoji.checkMark) {
          // A valid user has selected to ban the raid party.
          // Log that the banning is beginning and who approved of the action.
          client.success(staffChat, 'Banning!', `User ${modUser.tag} has chosen to ban the raid. It may take some time to finish banning all raid members.`);
          // Promisify a setInterval to ban members without rate limiting.
          await new Promise(resolve => {
            const interval = setInterval(() => {
              if (client.raidJoins.length !== 0) {
                // Ban the next member
                client.raidJoins.shift().ban({ days: 1, reason: 'Member of raid.' })
                  .catch(console.error);
              } else {
                // We've finished banning, annouce that raid mode is ending.
                staffChat.send('Finished banning all raid members. Raid Mode is deactivated.');
                actionLog.send(`The above ${client.raidMembersPrinted} members have been banned.`);
                // Reset all raid variables
                client.raidMode = false;
                client.raidJoins = {};
                client.raidMessage = null;
                client.raidMembersPrinted = 0;
                // Resolve this promise and clear interval.
                resolve();
                clearInterval(interval);
              }
            }, 100); // 100 ms is 10 bans a second, hopefully not too many.
          });
        } else {
          // A valid user has selected not to ban the raid party.
          client.error(staffChat, 'Not Banning!', `User ${modUser.tag} has chosen to not ban the raid. Raid Mode is deactivated.`);
          // Reset all raid variables
          client.raidMode = false;
          client.raidJoins = {};
          client.raidMessage = null;
          client.raidMembersPrinted = 0;
        }
      })
      .catch(console.error);
    // If there are new joins, regularly log them to nook-log and update the message with the count
    const updateRaid = setInterval(() => {
      // If the raid is over, don't update anymore.
      if (!client.raidMode)  {
        clearInterval(updateRaid);
      } else {
        client.raidMessage.edit(`**##### RAID MODE ACTIVATED #####**
<@&495865346591293443> <@&494448231036747777>
Would you like to ban all ${client.raidJoins.length} members that joined in the raid?
If you would like to remove any of the members from the list, use the \`.raidremove <ID>\` command.
A list of members that joined in the raid is being updated in <#630581732453908493>.
This message updates every 5 seconds, and you should wait to decide until the count stops increasing.`);
        // Grab all the new raid members since last update.
        if (client.raidMembersPrinted !== client.raidJoins.length) {
          const newMembers = client.raidJoins.slice(client.raidMembersPrinted);
          client.raidMembersPrinted += newMembers.length;
          let msg = '';
          newMembers.forEach(mem => {
            msg += `${mem.user.tag} (${mem.id})\n`;
          });
          actionLog.send(msg, { split: true });
        }
      }
    }, 5000);
  }

  // Set a timeout to remove them from the list after 10 seconds if not in raid mode.
  if (!client.raidMode) {
    setTimeout(() => {
      if (!client.raidMode) client.raidJoins.shift();
    }, 10000);
  } else {
    // We're in Raid Mode, don't make a fancy member join embed.
    return;
  }

  const time = Date.now();
  let accountAge = client.humanTimeBetween(time, member.user.createdTimestamp);

  // 172,800,000 ms is 48 hours.
  if (time - member.user.createdTimestamp < 172800000) {
    accountAge = `${client.emoji.warning} **NEW ACCOUNT** ${client.emoji.warning} ${accountAge}`;
  }

  let inviteField = 'Unknown';
  // Check which invite was used.
  const guildInvites = await member.guild.fetchInvites();
  // Existing invites
  const ei = client.invites;
  // Update cached invites
  client.invites = guildInvites;
  // Discover which invite was used
  const invite = guildInvites.find((i) => {
    if (!ei.has(i.code)) {
      // This is a new code, check if it's used.
      return i.uses > 0;
    }
    // This is a cached code, check if it's uses increased.
    return ei.get(i.code).uses < i.uses;
  });
    // If invite isn't valid, that most likely means the vanity URL was used so default to it.
  if (invite) {
    // Inviter
    const inviter = client.users.get(invite.inviter.id);
    inviteField = `${invite.code} from ${inviter.tag} (${inviter.id}) with ${invite.uses}`;
  } else {
    // Vanity URL was used
    inviteField = 'Vanity URL';
  }

  const embed = new Discord.RichEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL)
    .setColor('#1de9b6')
    .setTimestamp()
    .setFooter(`ID: ${member.id}`)
    .setThumbnail(member.user.displayAvatarURL)
    .addField('**Member Joined**', `<@${member.id}>`, true)
    .addField('**Join Position**', member.guild.memberCount, true)
    .addField('**Account Age**', accountAge, true)
    .addField('**Invite Used**', inviteField, true);

  member.guild.channels.get(client.getSettings(member.guild).actionLog).send(embed);
};
