const Discord = require('discord.js');

module.exports = async (client, oldMessage, newMessage) => {
  // Ignore all bots
  if (newMessage.author.bot) {
    return;
  }

  // Description value length limit for embeds is 1024
  const oldMsg = oldMessage.content.length > 499 ? `${oldMessage.content.slice(0,496)}...` : oldMessage.content.slice(0,499);
  const newMsg = newMessage.content.length > 499 ? `${newMessage.content.slice(0,496)}...` : newMessage.content.slice(0,499);

  const embed = new Discord.RichEmbed()
    .setTitle('Jump to Message')
    .setURL(`https://discordapp.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`)
    .setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL)
    .setColor('#00e5ff')
    .setTimestamp()
    .setFooter(`ID: ${newMessage.author.id}`)
    .addDescription(`**Message edited in** <#${newMessage.channel.id}>`)
    .addField('\u200b', `**Before:** ${oldMsg}\n**+After:** ${newMsg}`);

  newMessage.guild.channels.get(client.getSettings(newMessage.guild).actionLog).send(embed);
};
