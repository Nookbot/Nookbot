const { scheduleJob } = require('node-schedule');
const moment = require('moment-timezone');

module.exports = (client) => {
  if (!client.firstReady) {
    let counter = 1;
    client.firstReady = true;
    console.log('First ready event triggered, loading the guild.');
    const intv = setInterval(async () => {
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

      // Fetch reaction modules
      await client.fetchReactionModules();
      setInterval(async () => {
        await client.fetchReactionModules();
      }, 3600000);

      // Schedule reset of signup stats for mods and middlemen
      scheduleJob('resetSignUp', { dayOfWeek: 0, hour: 0, minute: 0 }, async () => {
        // Mod stats
        const mods = client.reactionSignUp.map((v, k) => ({ id: k, hours: v.hours ? v.hours.total : undefined })).sort((a, b) => b.hours - a.hours);
        let msg = `**Sign Up Sheet Statistics (Week ${moment().subtract(7, 'days').format('DD/MM/YYYY')} - ${moment().subtract(1, 'days').format('DD/MM/YYYY')})**\nRank - Name - Hours\nChannel/Category - Hours`;
        await client.asyncForEach(mods, async (k, i) => {
          if (k.id !== 'data') {
            const guild = client.guilds.cache.get(client.config.mainGuild);
            const modMember = guild.members.cache.get(k.id) || await guild.members.fetch(k.id);
            msg += `\n#${i + 1} - **${modMember.displayName}** (${k.id}) - \`${k.hours} hours\``;

            const mod = client.reactionSignUp.get(k.id);
            const { channelHours } = client.addHours(mod);
            msg += channelHours.length === 0 ? '\n' : `\n${channelHours.join('\n')}\n`;

            try {
              const dmChannel = await modMember.createDM();
              await dmChannel.send(`**Sign Up Sheet Statistics (Week ${moment().subtract(7, 'days').format('DD/MM/YYYY')} - ${moment().subtract(1, 'days').format('DD/MM/YYYY')})**\nName - Hours\nChannel/Category - Hours\n**${modMember ? modMember.displayName : 'Unknown Mod'}** (${k.id}) - ${k.hours} hours\n\n${channelHours.join('\n')}`);
              client.success(dmChannel, 'Reset Sign Up Statistics!', "I've reset sign up statistics! Above is your clocked hours for the week!");
            } catch (e) {
              // Nothing to do here
            }

            client.reactionSignUp.set(k.id, { total: 0 }, 'hours');
          }
        });

        const HMCmdsCh = client.channels.cache.get('776571947546443796') || await client.channels.fetch('776571947546443796');
        await HMCmdsCh.send(msg, { split: true });
        client.success(HMCmdsCh, 'Successfully Reset Sign Up Statistics!', "I've successfully reset sign up statistics for the week!");

        // Middleman stats
        const mm = client.mmSignUp.map((v, k) => ({ id: k, hours: v.hours })).sort((a, b) => b.hours - a.hours);
        let msgMM = `**Middleman Sign Up Statistics (Week ${moment().subtract(7, 'days').format('DD/MM/YYYY')} - ${moment().subtract(1, 'days').format('DD/MM/YYYY')})**\nRank - Name - Hours`;
        await client.asyncForEach(mm, async (k, i) => {
          if (k.id !== 'data') {
            const guild = client.guilds.cache.get(client.config.mainGuild);
            const mmMember = guild.members.cache.get(k.id) || await guild.members.fetch(k.id);
            msgMM += `\n#${i + 1} - **${mmMember.displayName}** (${k.id}) - \`${k.hours} hours\``;

            try {
              const dmChannel = await mmMember.createDM();
              await dmChannel.send(`**Middleman Sign Up Statistics (Week ${moment().subtract(7, 'days').format('DD/MM/YYYY')} - ${moment().subtract(1, 'days').format('DD/MM/YYYY')})**\nName - Hours\n**${mmMember ? mmMember.displayName : 'Unknown Middleman'}** (${k.id}) - ${k.hours} hours`);
              client.success(dmChannel, 'Reset Sign Up Statistics!', "I've reset middleman sign up statistics! Above is your clocked hours for the week!");
            } catch (e) {
              // Nothing to do here
            }

            client.mmSignUp.set(k.id, 0, 'hours');
          }
        });

        const HMMCh = client.channels.cache.get('784961291948654663') || await client.channels.fetch('776571947546443796');
        await HMMCh.send(msgMM, { split: true });
        client.success(HMMCh, 'Successfully Reset Middleman Sign Up Statistics!', "I've successfully reset middleman sign up statistics for the week!");
      });

      // Schedule remind events
      const remindEventsToSchedule = client.remindDB.keyArray();
      remindEventsToSchedule.forEach((key) => {
        const event = client.remindDB.get(key);
        scheduleJob(`Remind ${event.member}-${key}`, event.date, async () => {
          const text = `${client.emoji.clock} __**•• Reminder ••**__\n<@${event.member}> ${event.messageToSend}`;
          if (event.channel === 'DMs') {
            try {
              const member = await client.guilds.cache.get(client.config.mainGuild).members.fetch(event.member);
              const dmChannel = await member.createDM();
              await dmChannel.send(text);
            } catch (e) {
              // Nothing to do
            }
          } else {
            await client.channels.cache.get(event.channel).send(text);
          }

          client.remindDB.delete(key);
        });
      });

      // Schedule timers
      const timerEventsToSchedule = client.timers.keyArray();
      timerEventsToSchedule.forEach((key) => {
        const event = client.timers.get(key);
        scheduleJob(key, event.date, event.run);
      });

      // Schedule post for date in #daily-summary
      scheduleJob('dailySumPost', { hour: moment().tz('America/New_York').isDST() ? 4 : 5, minute: 0 }, () => {
        const dailySum = mainGuild.channels.cache.get('672949637359075339');
        const newPostNow = moment();
        dailySum.send(`__**${newPostNow.format('MMMM D, YYYY')}**__`);
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
