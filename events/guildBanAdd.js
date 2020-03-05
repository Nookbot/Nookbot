const Discord = require('discord.js');

module.exports = async (client, guild, user) => {
  const embed = new Discord.MessageEmbed()
    .setAuthor(user.tag, user.displayAvatarURL())
    .setColor('#ff9292')
    .setTimestamp()
    .setFooter(`ID: ${user.id}`)
    .setThumbnail(user.displayAvatarURL())
    .setTitle('**Member Banned**')
    .setDescription(user.id);

  if (!client.raidBanning) guild.channels.cache.get(client.getSettings(guild).modLog).send(embed);
};
