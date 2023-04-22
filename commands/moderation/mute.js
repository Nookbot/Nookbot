// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level, Discord) => {
  // Sets the member to the user mentioned
  let member = message.mentions.members.first() || client.guilds.cache.get(client.config.mainGuild).members.cache.get(args[0]);

  if (!member) {
    if (parseInt(args[0], 10)) {
      try {
        member = await client.guilds.cache.get(client.config.mainGuild).members.fetch(args[0]);
      } catch (err) {
        return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
      }
    }
  }

  if (!member) {
    return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
  }

  let timeoutMS;
  if (client.timeRegex.test(args[1])) {
    timeoutMS = client.stringToTime(args[1]);
  }

  if (timeoutMS > 2073600000) { // Max of 24 days, to make sure setTimeout doesn't overflow 32-bit signed int
    return client.error(message.channel, 'Timeout Argument Too High!', 'You cannot have the timeout surpass 24 days!');
  }

  try {
    let mutedMember;
    if (timeoutMS === undefined) {
      // Give muted role for an indeterminate length mute, and remove current timeout and muteDB entries
      mutedMember = await member.roles.add(client.config.mutedRole);
      if (mutedMember.voice.channel) {
        mutedMember = await mutedMember.voice.disconnect();
      }
      mutedMember = await mutedMember.timeout(null);
      if (client.muteDB.has(mutedMember?.id)) {
        client.muteDB.delete(mutedMember.id);
      }
    } else {
      // Use timeout feature for timed mutes
      mutedMember = await member.timeout(timeoutMS);
      mutedMember = await mutedMember.roles.add(client.config.mutedRole);
    }

    // Send mute embed
    const muteEmbed = new Discord.MessageEmbed()
      .setAuthor({ name: mutedMember.user.tag, iconURL: mutedMember.user.displayAvatarURL() })
      .setTimestamp()
      .setColor('#ff9292')
      .setFooter({ text: `ID: ${mutedMember.id}` })
      .addField('**Member Muted**', `<@${mutedMember.id}>`);
    client.channels.cache.get(client.config.modLog).send({ embeds: [muteEmbed] });

    // If this is a timed muted, schedule unmute embed
    if (timeoutMS !== undefined) {
      client.muteDB.set(mutedMember.id, timeoutMS + Date.now());
      setTimeout(() => {
        if (client.muteDB.has(mutedMember?.id) && (client.muteDB.get(mutedMember.id) || 0) < Date.now()) {
          mutedMember?.roles?.remove(client.config.mutedRole);
          client.muteDB.delete(mutedMember.id);
          const unmuteEmbed = new Discord.MessageEmbed()
            .setAuthor({ name: mutedMember.user.tag, iconURL: mutedMember.user.displayAvatarURL() })
            .setTimestamp()
            .setColor('#1de9b6')
            .setFooter({ text: `ID: ${mutedMember.id}` })
            .addField('**Member Unmuted**', `<@${mutedMember.id}>`);
          client.channels.cache.get(client.config.modLog).send({ embeds: [unmuteEmbed] });
        }
      }, timeoutMS);
    }
  } catch (e) {
    return client.error(message.channel, 'Error!', `Failed to mute member! Error: ${e}`);
  }

  return client.success(message.channel, 'Success!', `${message.author}, I've successfully muted ${member} ${timeoutMS !== undefined ? `for ${client.humanTimeBetween(timeoutMS, 0)}` : 'indefinitely'}!`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: [],
  permLevel: 'Redd',
  args: 1,
};

module.exports.help = {
  name: 'mute',
  category: 'moderation',
  description: 'Gives the mentioned user the Muted role',
  usage: 'mute <@user> <time>',
  details: '<@user> => Any valid member of the server\n<time> => Time to mute for',
};
