const Discord = require('discord.js');

module.exports = async (client, ban) => {
  if (ban.guild.id !== client.config.mainGuild || client.raidBanning || client.raidBans.includes(ban.user.id)) {
    return;
  }

  const embed = new Discord.MessageEmbed()
    .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL() })
    .setColor('#ff9292')
    .setTimestamp()
    .setFooter({ text: `ID: ${ban.user.id}` })
    .setThumbnail(ban.user.displayAvatarURL())
    .setTitle('**Member Banned**')
    .setDescription(ban.user.id);

  client.channels.cache.get(client.config.modLog).send({ embeds: [embed] });
};
