// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
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

  let muteTime = 86400000; // 1 Day
  if (parseInt(args[1], 10)) {
    muteTime = 60000 * parseInt(args[1], 10);
  }

  try {
    // Times out the member and removes the trade and voice roles
    const mutedMember = await member.timeout(muteTime);
    await mutedMember.roles.remove([client.config.tradeRole, client.config.voiceRole]);
    // Send mute embed
    const muteEmbed = new Discord.MessageEmbed()
      .setAuthor({ name: mutedMember.user.tag, iconURL: mutedMember.user.displayAvatarURL() })
      .setTimestamp()
      .setColor('#ff9292')
      .setFooter({ text: `ID: ${mutedMember.id}` })
      .addField(`**Member Muted**`, `<@${mutedMember.id}>`);
    client.channels.cache.get(client.config.modLog).send({ embeds: [muteEmbed] });
    // Schedule unmute embed
    client.muteDB.set(mutedMember.id, muteTime + Date.now());
    setTimeout(() => {
      if (client.muteDB.has(mutedMember.id) && (client.muteDB.get(mutedMember.id) || 0) < Date.now()) {
        client.muteDB.delete(mutedMember.id);
        const unmuteEmbed = new Discord.MessageEmbed()
          .setAuthor({ name: mutedMember.user.tag, iconURL: mutedMember.user.displayAvatarURL() })
          .setTimestamp()
          .setColor('#1de9b6')
          .setFooter({ text: `ID: ${mutedMember.id}` })
          .addField(`**Member Unmuted**`, `<@${mutedMember.id}>`);
        client.channels.cache.get(client.config.modLog).send({ embeds: [unmuteEmbed] });
      }
    }, muteTime);
  } catch (e) {
    return client.error(message.channel, 'Error!', `Failed to mute member! Error: ${e}`);
  }

  return client.success(message.channel, 'Success!', `${message.author}, I've successfully muted ${member} for ${client.humanTimeBetween(muteTime, 0)}!`);
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
  details: '<@user> => Any valid member of the server\n<time> => Time to mute for, in minutes',
};
