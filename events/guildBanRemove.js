const Discord = require('discord.js');

module.exports = async (client, ban) => {
  if (ban.guild.id !== client.config.mainGuild) {
    return;
  }

  const embed = new Discord.MessageEmbed()
    .setAuthor({ name: ban.user.tag, iconURL: ban.user.displayAvatarURL() })
    .setColor('#1de9b6')
    .setTimestamp()
    .setFooter({ text: `ID: ${ban.user.id}` })
    .setThumbnail(ban.user.displayAvatarURL())
    .setTitle('**Member Unbanned**')
    .setDescription(ban.user.id);

  client.channels.cache.get(client.config.modLog).send({ embeds: [embed] });
};
