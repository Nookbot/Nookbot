const Discord = require('discord.js');

module.exports = async (client, oldMessage, newMessage) => {
  // Field value length limit for embeds is 1024
  const oldMsg = oldMessage.content.length > 499 ? `${oldMessage.content.slice(0,496)}...` : oldMessage.content.slice(0,499);
  const newMsg = newMessage.content.length > 499 ? `${newMessage.content.slice(0,496)}...` : newMessage.content.slice(0,499);

  const embed = new Discord.RichEmbed()
    .setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL)
    .setColor('#00e5ff')
    .setTimestamp()
    .setFooter(`ID: ${newMessage.author.id}`)
    .addField(`**Message Edited in** <#${newMessage.channel.id}> [Jump](https://discordapp.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id} 'Jump to Message')`, `**Before:** ${oldMsg}\n**+After:** ${newMsg}`);

  newMessage.guild.channels.get(client.getSettings(newMessage.guild).actionLog).send(embed);
};
