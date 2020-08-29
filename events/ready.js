const schedule = require('node-schedule');
const moment = require('moment');

module.exports = (client) => {
  if (!client.firstReady) {
    let counter = 1;
    client.firstReady = true;
    console.log('First ready event triggered, loading the guild.');
    const intv = setInterval(() => {
      const mainGuild = client.guilds.cache.get(client.config.mainGuild);
      const modMailGuild = client.guilds.cache.get(client.config.modMailGuild);
      if (!mainGuild || !modMailGuild) {
        console.log(`  Attempting to wait for both guilds to load ${counter}...`);
        counter += 1;
        return;
      }
      clearInterval(intv);
      console.log('Guilds successfully loaded.');

      // Emoji usage tracking database init
      mainGuild.emojis.cache.forEach((e) => {
        // If EmojiDB does not have the emoji, add it.
        if (!client.emojiDB.has(e.id)) {
          client.emojiDB.set(e.id, 0);
        }
      });
      // Sweep emojis from the DB that are no longer in the guild emojis
      client.emojiDB.sweep((v, k) => !mainGuild.emojis.cache.has(k));

      setInterval(() => {
        try {
          client.memberStats.set(client.memberStats.autonum, { time: Date.now(), members: mainGuild.memberCount });
          client.user.setActivity(`ACNH with ${mainGuild.memberCount} users!`);
        } catch (e) {
          // Don't need any handling
        }
      }, 30000);

      // Save the current collection of guild invites.
      mainGuild.fetchInvites().then((guildInvites) => {
        client.invites = guildInvites;
      });

      // Clear any session channels from the server if they have no members
      client.sessionDB.keyArray().forEach((sesID) => {
        const sessionChannel = client.channels.cache.get(sesID);
        if (sessionChannel && sessionChannel.members.size === 0
            && !sessionChannel.deleted && sessionChannel.deletable) {
          // Session is empty, delete the channel and database entry
          sessionChannel.delete('[Auto] Purged empty session channels on ready event.').then((delChannel) => {
            // Delete sessionDB entry
            client.sessionDB.delete(delChannel.id);
          }).catch((error) => {
            console.error(error);
          });
        }
      });

      // Reschedule any unmutes from muteDB
      const now = Date.now();
      client.muteDB.keyArray().forEach((memID) => {
        const unmuteTime = client.muteDB.get(memID);
        mainGuild.members.fetch(memID).then((member) => {
          if (unmuteTime < now) {
            // Immediately unmute
            client.muteDB.delete(memID);
            member.roles.remove(client.config.mutedRole, 'Scheduled unmute through reboot.');
          } else {
            // Schedule unmute
            setTimeout(() => {
              if ((client.muteDB.get(memID) || 0) < Date.now()) {
                client.muteDB.delete(memID);
                member.roles.remove(client.config.mutedRole, 'Scheduled unmute through reboot.');
              }
            }, unmuteTime - now);
          }
        }).catch(() => {
          // Probably no longer a member, don't schedule their unmute and remove entry from DB.
          client.muteDB.delete(memID);
        });
      });

      // Cache messages for reaction roles
      client.reactionRoleDB.keyArray().forEach((msgID) => {
        const { channel } = client.reactionRoleDB.get(msgID);
        client.channels.cache.get(channel).messages.fetch(msgID);
      });

      // Cache signup sheet
      const data = client.reactionSignUp.get('data');
      client.channels.cache.get(data.channelID).messages.fetch(data.messageID);

      // Schedule reset of signup stats
      schedule.scheduleJob({ dayOfWeek: 0, hour: 0, minute: 0 }, async () => {
        const mods = client.reactionSignUp.map((v, k) => ({ id: k, hours: v.hoursThisWeek })).sort((a, b) => b.hours - a.hours);
        let msg = `**Sign Up Sheet Statistics (Week ${moment().subtract(7, 'days').format('DD MM YYYY')}-${moment().format('DD MM YYYY')})**\nRank - Name - Hours`;
        client.asyncForEach(mods, async (k, i) => {
          if (k.id !== 'data') {
            const guild = client.guilds.cache.get(client.config.mainGuild);
            const modMember = guild.members.cache.get(k.id) || await guild.members.fetch(k.id);
            msg += `\n#${i + 1} - **${modMember ? modMember.displayName : 'Unknown Mod'}** (${k.id}) - ${k.hoursThisWeek} hours`;
            client.reactionSignUp.set(k.id, 0, 'signUpsThisWeek');
            client.reactionSignUp.set(k.id, 0, 'hoursThisWeek');
          }
        });

        const HMChannel = client.channels.cache.get('693638950404882473') || await client.channels.fetch('693638950404882473');
        await HMChannel.send(msg, { split: true });
        return client.success(HMChannel, 'Successfully Reset Sign Up Statistics!', "I've successfully reset sign up statistics for the week!");
      });

      try {
        client.startTwitterFeed();
      } catch (err) {
        // The stream function returned an error
        console.error(err);
      }

      // Logging a ready message on first boot
      console.log(`Ready sequence finished, with ${mainGuild.memberCount} users, in ${mainGuild.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    }, 1000);
  } else {
    console.log('########## We had a second ready event trigger for some reason. ##########');
  }
};
