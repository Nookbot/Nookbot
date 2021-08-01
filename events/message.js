/* eslint-disable max-len */
/* eslint-disable consistent-return */
const Discord = require('discord.js');
const moment = require('moment');
const schedule = require('node-schedule');

const cooldowns = new Discord.Collection();

module.exports = async (client, message) => {
  // Ignore all bots
  if (message.author.bot) {
    // If message sent by ban appeal webhook bot account, and in the ban appeals channel
    // Or message sent by promo app webhook and in promo app channel
    if ((message.author.id === '695145674081042443' && message.channel.id === '680479301857968237')
    || (message.author.id === '823029874553913384' && message.channel.id === '823026976083279883')) {
      await message.react(client.emoji.checkMark);
      await message.react(client.emoji.redX);
    }

    if (message.author.id === '774523954286034965' && message.channel.id === '808142064180133939') {
      if (message.embeds[0] && message.embeds[0].title !== null && message.embeds[0].title.toLowerCase().includes('upcoming')) {
        await message.channel.send('__**•• Trivia Battle ••**__\n<@&811251712987365417> Battle starting in **1 hour**!');
        await message.pin();

        const dateWhenGameStarts = moment().add(1, 'h').toDate();
        const gameStart = async () => {
          await message.channel.send('__**•• Trivia Battle ••**__\n<@&811251712987365417> Battle starting now!');
          await message.channel.updateOverwrite(message.guild.id, { SEND_MESSAGES: true }, 'Unlock channel for trivia');
        };
        client.timers.set('triviaGameStart', { date: dateWhenGameStarts, run: gameStart });

        if (!schedule.scheduledJobs.trivaGameStart) {
          schedule.scheduleJob('triviaGameStart', dateWhenGameStarts, gameStart);
        } else {
          schedule.rescheduleJob('triviaGameStart', dateWhenGameStarts);
        }
      } else if (message.embeds[0] && message.embeds[0].title !== null && message.embeds[0].title.toLowerCase().includes('winner')) {
        setTimeout(async () => {
          await message.channel.send('__**•• Channel Is About to Lock! ••**__\nThis channel will be locked in 1 minute.');
        }, 2000);

        const dateToLockChannel = moment().add(1, 'm').toDate();
        const lockchannel = async () => {
          await message.channel.updateOverwrite(message.guild.id, { SEND_MESSAGES: false }, 'Lock trivia channel');
          await message.channel.send('__**•• Channel Locked! ••**__\nThis channel has been locked as there is no game currently ongoing. It will be unlocked prior to the next trivia battle. Thanks for playing!');
          const pinned = await message.channel.messages.fetchPinned();
          await pinned.find((p) => p.embeds[0].title.toLowerCase().includes('upcoming')).unpin();
        };
        client.timers.set('lockTriviaChannel', { date: dateToLockChannel, run: lockchannel });
        if (schedule.scheduledJobs.lockTriviaChannel) {
          schedule.cancelJob('lockTriviaChannel');
        }
        schedule.scheduleJob('lockTriviaChannel', dateToLockChannel, lockchannel);
      }
    }
    return;
  }

  // React in needs-voting channel
  if (message.channel.id === '727674382415298691') {
    const guilty = message.guild.emojis.cache.get('727679416532205660');
    const inconclusive = message.guild.emojis.cache.get('727679946323132579');
    const innocent = message.guild.emojis.cache.get('727679357061038133');
    await message.react(guilty);
    await message.react(inconclusive);
    await message.react(innocent);
  }

  // Ping in #request-a-middleman
  if (message.channel.id === '750150303692619817') {
    let ping = false;
    if (!cooldowns.has('middlemanping') || (Date.now() - cooldowns.get('middlemanping')) > 300000) {
      ping = true;
      cooldowns.set('middlemanping', Date.now());
    }

    if (ping) {
      const mmChannel = client.channels.cache.get('776980847273967626');
      const mmSignUp = mmChannel.messages.cache.get('826305438277697567');
      const mmToPing = mmSignUp.reactions.cache.first().users.cache.filter((mm) => mm.id !== client.user.id).map((mm) => `<@${mm.id}>`);
      message.channel.send(mmToPing.join(', '));
    }
  }

  if (message.guild && !message.member) {
    await message.guild.members.fetch(message.author);
  }

  const level = client.permLevel(message);

  if (message.guild && message.guild.id === client.config.mainGuild) {
    // User activity tracking
    client.userDB.set(message.author.id, message.createdTimestamp, 'lastMessageTimestamp');

    // Emoji finding and tracking
    const regex = /<a?:\w+:([\d]+)>/g;
    const msg = message.content;
    let regMatch;
    while ((regMatch = regex.exec(msg)) !== null) {
      // If the emoji ID is in our emojiDB, then increment its count
      if (client.emojiDB.has(regMatch[1])) {
        client.emojiDB.inc(regMatch[1]);
      }
    }

    // Banned Words
    if (level[1] < 2) {
      const tokens = message.content.split(/ +/g);
      let ban = false;
      let del = false;
      let match;

      for (let index = 0; index < tokens.length; index++) {
        if (ban) {
          break;
        }
        const matches = client.bannedWordsFilter.search(tokens[index]);

        for (let mIndex = 0; mIndex < matches.length; mIndex++) {
          const chkMatch = client.bannedWordsDB.find((w) => w.word === matches[mIndex].original && w.phrase.join(' ') === matches[mIndex].item.phrase.join(' '));

          // Only check if we're not already deleting this message, or the matched word is an autoBan
          if (!del || chkMatch.autoBan) {
            let chkDel = false;
            let matchedPhrase = true;
            if (chkMatch.phrase.length !== 0) {
              if (chkMatch.phrase.length < (tokens.length - index)) {
                for (let i = 0; i < chkMatch.phrase.length; i++) {
                  if (tokens[index + (i + 1)].toLowerCase() !== chkMatch.phrase[i].toLowerCase()) {
                    matchedPhrase = false;
                    break;
                  }
                }
              } else {
                matchedPhrase = false;
              }
            }

            if (matchedPhrase) {
              if (chkMatch.blockedChannels && chkMatch.blockedChannels.length !== 0) {
                if (chkMatch.blockedChannels.includes(message.channel.id)) {
                  chkDel = true;
                }
              } else {
                chkDel = true;
              }
            }

            if (!del && chkDel) {
              // This is to save the first match that caused the message to get deleted or banned
              match = chkMatch;
              del = chkDel;
            }

            if (chkDel && chkMatch.autoBan) {
              match = chkMatch;
              ban = true;
              break; // Break on autoBan because we don't need to check for any other banned words.
            }
          }
        }
      }

      if (ban || del) {
        const embed = new Discord.MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
          .setColor('#ff9292')
          .setFooter(`ID: ${message.author.id}`)
          .setTimestamp()
          .setDescription(`**Banned word sent by ${message.author} in ${message.channel}**\n${message.content.slice(0, 1800)}`);

        const modLogCh = client.channels.cache.get(client.config.modLog);

        message.delete()
          .catch((err) => client.error(modLogCh, 'Message Delete Failed!', `I've failed to delete a message containing a banned word from ${message.author}! ${err}`));

        if (ban) {
          message.guild.members.ban(message.author, { reason: '[Auto] Banned Word', days: 1 })
            .catch((err) => client.error(modLogCh, 'Ban Failed!', `I've failed to ban ${message.author}! ${err}`));
        }

        embed.addField('Match', match.phrase.length === 0 ? match.word : `${match.word} ${match.phrase.join(' ')}`, true)
          .addField('Action', ban ? 'Banned' : 'Deleted', true);

        modLogCh.send(embed);
        return;
      }
    }

    // Anti Mention Spam
    if (message.mentions.members && message.mentions.members.size > 10) {
      // They mentioned more than 10 members, automute them for 10 mintues.
      if (message.member && level[1] < 2) {
        // Mute
        message.member.roles.add(client.config.mutedRole, 'Mention Spam');
        // Delete Message
        if (!message.deleted) {
          message.delete();
        }
        // Schedule unmute
        setTimeout(() => {
          try {
            message.member.roles.remove(client.config.mutedRole, 'Unmuted after 10 mintues for Mention Spam');
          } catch (error) {
            // Couldn't unmute, oh well
            console.error('Failed to unmute after Anit Mention Spam');
            console.error(error);
          }
        }, 600000);
        // Notify mods so they may ban if it was a raider.
        message.guild.channels.cache.get(client.config.staffChat).send(`**Mass Mention Attempt!**
  <@&495865346591293443> <@&693636228695720038>
  The member **${message.author.tag}** just mentioned ${message.mentions.members.size} members and was automatically muted for 10 minutes!
  They have been a member of the server for ${client.humanTimeBetween(Date.now(), message.member.joinedTimestamp)}.
  If you believe this member is a mention spammer bot, please ban them with the command:
  \`.sting ${message.author.id} 25 Raid Mention Spammer\``);
      }
    }

    // Delete non-image containing messages from image only channels
    if (message.guild && client.config.imageOnlyChannels.includes(message.channel.id)
        && message.attachments.size === 0
        && !message.content.match(/https?:\/\//gi)
        && level[1] < 2) {
      // Message is in the guild's image only channels, without an image or link in it, and is not a mod's message, so delete
      if (!message.deleted && message.deletable) {
        message.delete();
        client.imageOnlyFilterCount += 1;
        if (client.imageOnlyFilterCount === 5) {
          client.imageOnlyFilterCount = 0;
          const autoMsg = await message.channel.send('Image Only Channel!\nThis channel only allows posts with images. Everything else is automatically deleted.');
          autoMsg.delete({ timeout: 30000 });
        }
      }
      return;
    }

    // Delete messages that don't contain BOTH image and text from image&text only channels
    if (message.guild && client.config.imageAndTextOnlyChannels.includes(message.channel.id)
      && (message.attachments.size === 0 || message.content === '')
      && level[1] < 2) {
      if (!message.deleted && message.deletable) {
        message.delete();
        client.imageAndTextOnlyFilterCount += 1;
        if (client.imageAndTextOnlyFilterCount === 5) {
          client.imageAndTextOnlyFilterCount = 0;
          const autoMsg = await message.channel.send('Image And Text Channel!\nThis channel only allows messages with both images and text. Everything else is automatically deleted. This allows for keywords to be searchable.');
          autoMsg.delete({ timeout: 30000 });
        }
      }
      return;
    }

    // Delete posts with too many new lines or charactersto prevent spammy messages
    if (message.guild && ((message.content.match(/\n/g) || []).length >= client.config.newlineLimit
        || (message.content.length > client.config.charLimit))
        && !client.config.newlineAndCharProtectedChannels.includes(message.channel.id)
        && level[1] < 2) {
      // Message is in the guild, in a channel that has a limit on newline characters, and has too many or too many links + attachments, and is not a mod's message, so delete
      if (!message.deleted && message.deletable) {
        message.delete();
        client.newlineLimitFilterCount += 1;
        if (client.newlineLimitFilterCount === 5) {
          client.newlineLimitFilterCount = 0;
          const autoMsg = await message.channel.send('Too Many New Lines or Characters!\nThis channel only allows posts with less than 10 new lines and less than 1000 characters. Messages with more than that are automatically deleted.');
          autoMsg.delete({ timeout: 30000 });
        }
      }
      return;
    }

    // Delete posts with too many attachments or links
    if (message.guild && (message.attachments.size + (message.content.match(/https?:\/\//gi) || []).length) >= client.config.imageLinkLimit
       && !client.config.imageAndLinkProtectedChannels.includes(message.channel.id)
       && level[1] < 2) {
      if (!message.deleted && message.deletable) {
        message.delete();
        client.imageAndLinkFilterCount += 1;
        if (client.imageAndLinkFilterCount === 5) {
          client.imageAndLinkFilterCount = 0;
          const autoMsg = await message.channel.send('Too Many Attachments + Links!\nThis channel only allows posts with less 3 attachments + links. Messages with more than that are automatically deleted.');
          autoMsg.delete({ timeout: 30000 });
        }
      }
      return;
    }

    // Delete posts with @ mentions in villager and turnip channels
    if (message.guild && client.config.noMentionChannels.includes(message.channel.id)
      && message.mentions.members.size > 0
      && level[1] < 2) {
    // Message is in the guild, in a channel that restricts mentions, and is not a mod's message, so delete
      if (!message.deleted && message.deletable) {
        message.delete();
        client.noMentionFilterCount += 1;
        if (client.noMentionFilterCount === 5) {
          client.noMentionFilterCount = 0;
          const autoMsg = await message.channel.send('No Mention Channel!\nThis channel is to be kept clear of @ mentions of any members. Any message mentioning another member will be automatically deleted.');
          autoMsg.delete({ timeout: 30000 });
        }
      }
      return;
    }

    // Delete posts with links in link blacklisted channels
    if (message.guild && message.content.match(/https?:\/\//gi)
        && client.config.linkBlacklistChannels.includes(message.channel.id)
        && level[1] < 2) {
      if (!message.deleted && message.deletable) {
        message.delete();
        client.linkBlacklistFilterCount += 1;
        if (client.linkBlacklistFilterCount === 5) {
          client.linkBlacklistFilterCount = 0;
          const autoMsg = await message.channel.send('Links Not Allowed!\nThis channel prohibits messages with links. Messages with links are automatically deleted.');
          autoMsg.delete({ timeout: 30000 });
        }
      }
      return;
    }
  }

  // Ignore messages not starting with the prefix
  if (message.content.indexOf(client.config.prefix) !== 0) {
    return;
  }

  // Our standard argument/command name definition.
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data and aliases from the client.commands Enmap
  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
  const enabledCmds = client.enabledCmds.get(command) || client.enabledCmds.get(client.aliases.get(command));

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) {
    return;
  }

  if (message.guild && message.guild.id === client.config.modMailGuild
    && cmd.help.name !== 'beesting'
    && cmd.help.name !== 'beestinglog'
    && cmd.help.name !== 'info'
    && cmd.help.name !== 'nicknames'
    && cmd.help.name !== 'usernames'
    && cmd.help.name !== 'mute'
    && cmd.help.name !== 'unmute'
    && cmd.help.name !== 'medicine'
    && cmd.help.name !== 'remind') {
    return;
  }

  if (enabledCmds === false && level[1] < 4) {
    return client.error(message.channel, 'Command Disabled!', 'This command is currently disabled!');
  }

  if (!message.guild && cmd.conf.guildOnly) {
    return client.error(message.channel, 'Command Not Available in DMs!', 'This command is unavailable in DMs. Please use it in a server!');
  }

  if (cmd.conf.blockedChannels && cmd.conf.blockedChannels.includes(message.channel.id) && level[1] < 4) {
    return client.error(message.channel, 'Command Not Available in this Channel!', 'You will have to use this command in the <#549858839994826753> channel!');
  }

  if (cmd.conf.allowedChannels && !cmd.conf.allowedChannels.includes(message.channel.id) && !cmd.conf.allowedChannels.includes(message.channel.parentID)) {
    if (message.guild ? message.guild.id !== client.config.modMailGuild : true) {
      if (cmd.help.name === 'beestinglog') {
        if (level[1] >= 4 && args.length > 0) {
          return;
        }
      } else if (level[1] < 4) {
        return client.error(message.channel, 'Command Not Available in this Channel!', `You will have to use this command in one of the allowed channels: ${cmd.conf.allowedChannels.map((ch) => `<#${ch}>`).join(', ')}.`);
      }
    }
  }

  // eslint-disable-next-line prefer-destructuring
  message.author.permLevel = level[1];

  if (level[1] < client.levelCache[cmd.conf.permLevel]) {
    if (level[1] > 2) {
      client.error(message.channel, 'Invalid Permissions!', `You do not currently have the proper permssions to run this command!\n**Current Level:** \`${level[0]}: Level ${level[1]}\`\n**Level Required:** \`${cmd.conf.permLevel}: Level ${client.levelCache[cmd.conf.permLevel]}\``);
    }
    return console.log(`${message.author.tag} (${message.author.id}) tried to use cmd '${cmd.help.name}' without proper perms!`);
  }

  if (cmd.conf.args && (cmd.conf.args > args.length)) {
    return client.error(message.channel, 'Invalid Arguments!', `The proper usage for this command is \`${client.config.prefix}${cmd.help.usage}\`! For more information, please see the help command by using \`${client.config.prefix}help ${cmd.help.name}\`!`);
  }

  if (level[1] < 2) {
    if (!cooldowns.has(cmd.help.name)) {
      cooldowns.set(cmd.help.name, new Discord.Collection());
    }

    const now = Date.now();
    const channels = cooldowns.get(cmd.help.name);
    const cooldownAmount = 5000;

    if (channels.has(message.channel.id)) {
      const expirationTime = channels.get(message.channel.id) + cooldownAmount;

      if (now < expirationTime) {
        return client.error(message.channel, 'Command Already In Use!', 'This command is currently in use in this channel!');
      }
    }

    channels.set(message.channel.id, now);
    setTimeout(() => channels.delete(message.channel.id), cooldownAmount);
  }

  // Run the command
  console.log(`${message.author.tag} (${message.author.id}) ran cmd '${cmd.help.name}' in ${message.guild ? `#${message.channel.name}` : 'DMs'}!`);
  cmd.run(client, message, args, level[1], Discord);
};
