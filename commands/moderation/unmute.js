// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level, Discord) => { // eslint-disable-line no-unused-vars
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

  // Removes the timeout from the member
  member.timeout(null)
    .then(() => client.success(message.channel, 'Success!', `${message.author}, I've successfully unmuted ${member}!`))
    .catch((err) => client.error(message.channel, 'Error!', `Failed to unmute member! Error: ${err}`));
  // Create unmute embed and remove scheduled unmute embed
  const unmuteEmbed = new Discord.MessageEmbed()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTimestamp()
    .setColor('#1de9b6')
    .setFooter({ text: `ID: ${member.id}` })
    .addField(`**Member Unmuted**`, `<@${member.id}>`);
  client.channels.cache.get(client.config.modLog).send({ embeds: [unmuteEmbed] });
  client.muteDB.delete(member.id);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['um'],
  permLevel: 'Redd',
  args: 1,
};

module.exports.help = {
  name: 'unmute',
  category: 'moderation',
  description: 'Removes the mentioned user the Muted role',
  usage: 'unmute <@user>',
  details: '<@user> => Any valid member of the server',
};
