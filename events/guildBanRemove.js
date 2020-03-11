const Discord = require('discord.js');

module.exports = async (client, guild, user) => {
  const embed = new Discord.MessageEmbed()
    .setAuthor(user.tag, user.displayAvatarURL())
    .setColor('#1de9b6')
    .setTimestamp()
    .setFooter(`ID: ${user.id}`)
    .setThumbnail(user.displayAvatarURL())
    .setTitle('**Member Unbanned**')
    .setDescription(user.id);

  guild.channels.cache.get(client.getSettings(guild).modLog).send(embed);
};
