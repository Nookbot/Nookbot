const Discord = require('discord.js');

module.exports = (client) => {
  client.raidModeActivate = async (guild) => {
    // Enable Raid Mode
    client.raidMode = true;
    // Save @everyone role and staff/actionlog channels here for ease of use.
    const { everyone } = guild.roles;
    const staffChat = guild.channels.cache.get(client.config.staffChat);
    const joinLeaveLog = guild.channels.cache.get(client.config.joinLeaveLog);

    const generalChat = guild.channels.cache.get('538938170822230026');
    const acnhChat = guild.channels.cache.get('494376688877174785');
    const raidMsg = "**Raid Ongoing**!\nWe're sorry to inconvenience everyone, but we've restricted all message sending capabilities due to a suspected raid. Don't worry though, you'll be back to chatting about your favorite game in no time, yes yes!";
    const noMoreRaidMsg = "**Raid Mode Has Been Lifted**!\nWe've determined that it's safe to lift raid mode precautions and allow everyone to send messages again! Channels should open up again immediately, yes yes!";

    await generalChat.send(raidMsg);
    await acnhChat.send(raidMsg);

    // Create a Permissions object with the permissions of the @everyone role, but remove Send Messages.
    const perms = new Discord.Permissions(everyone.permissions).remove('SEND_MESSAGES');
    everyone.setPermissions(perms);

    // Send message to staff with prompts
    client.raidMessage = await staffChat.send(`**##### RAID MODE ACTIVATED #####**
<@&495865346591293443> <@&494448231036747777>

A list of members that joined in the raid is being updated in <#689260556460359762>.
This message updates every 5 seconds, and you should wait to decide until the count stops increasing.

If you would like to remove any of the members from the list, use the \`.raidremove <ID>\` command.

Would you like to ban all ${client.raidJoins.length} members that joined in the raid?`);
    await client.raidMessage.react(client.emoji.checkMark);
    await client.raidMessage.react(client.emoji.redX);
    // Listen for reactions and log which action was taken and who made the decision.
    const filter = (reaction, user) => [client.emoji.checkMark, client.emoji.redX].includes(reaction.emoji.name)
            && guild.members.fetch(user).then((m) => m.hasPermission('BAN_MEMBERS')) && !user.bot;
    client.raidMessage.awaitReactions(filter, { max: 1 })
      .then(async (collected) => {
        const reaction = collected.first();
        const modUser = reaction.users.cache.last();
        if (reaction.emoji.name === client.emoji.checkMark) {
          // A valid user has selected to ban the raid party.
          // Log that the banning is beginning and who approved of the action.
          client.success(staffChat, 'Banning!', `User ${modUser.tag} has chosen to ban the raid. It may take some time to finish banning all raid members.`);
          client.raidBanning = true;
          // Create a setInterval to ban members without rate limiting.
          const interval = setInterval(() => {
            if (client.raidJoins.length !== 0) {
              // Ban the next member
              client.raidJoins.shift().ban({ days: 1, reason: 'Member of raid.' })
                .catch(console.error);
            } else {
              // We've finished banning, annouce that raid mode is ending.
              staffChat.send('Finished banning all raid members. Raid Mode is deactivated.');
              joinLeaveLog.send(`The above ${client.raidMembersPrinted} members have been banned.`);
              // Reset all raid variables
              client.raidMode = false;
              // Deactivate Raid Banning after a few seconds to allow for other events generated to finish
              setTimeout(() => {
                client.raidBanning = false;
              }, 15000);
              client.raidJoins = [];
              client.raidMessage = null;
              client.raidMembersPrinted = 0;

              generalChat.send(noMoreRaidMsg);
              acnhChat.send(noMoreRaidMsg);
              // Allow users to send messages again.
              perms.add('SEND_MESSAGES');
              everyone.setPermissions(perms);
              clearInterval(interval);
            }
          }, 100); // 100 ms is 10 bans a second, hopefully not too many.
        } else {
          // A valid user has selected not to ban the raid party.
          client.error(staffChat, 'Not Banning!', `User ${modUser.tag} has chosen to not ban the raid. Raid Mode is deactivated.`);
          // Reset all raid variables
          client.raidMode = false;
          client.raidJoins = [];
          client.raidMessage = null;
          client.raidMembersPrinted = 0;
          // Allow users to send messages again.
          generalChat.send(noMoreRaidMsg);
          acnhChat.send(noMoreRaidMsg);

          perms.add('SEND_MESSAGES');
          everyone.setPermissions(perms);
        }
      })
      .catch(console.error);
    // If there are new joins, regularly log them to nook-log and update the message with the count
    let msg = '**##### RAID MODE ACTIVATED #####**\nBELOW IS A LIST OF ALL MEMBERS THAT JOINED IN THE RAID';
    const updateRaid = setInterval(() => {
      // If the raid is over, don't update anymore.
      if (!client.raidMode) {
        clearInterval(updateRaid);
      } else if (!client.raidBanning) {
        client.raidMessage.edit(`**##### RAID MODE ACTIVATED #####**
<@&495865346591293443> <@&494448231036747777>

A list of members that joined in the raid is being updated in <#689260556460359762>.
This message updates every 5 seconds, and you should wait to decide until the count stops increasing.

If you would like to remove any of the members from the list, use the \`.raidremove <ID>\` command.

Would you like to ban all ${client.raidJoins.length} members that joined in the raid?`);
        // Grab all the new raid members since last update.
        if (client.raidMembersPrinted !== client.raidJoins.length) {
          const newMembers = client.raidJoins.slice(client.raidMembersPrinted);
          client.raidMembersPrinted += newMembers.length;
          newMembers.forEach((mem) => {
            msg += `\n${mem.user.tag} (${mem.id})`;
          });
          joinLeaveLog.send(msg, { split: true });
          msg = '';
        }
      }
    }, 5000);
  };
};
