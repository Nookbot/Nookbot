const Discord = require('discord.js');
const moment = require('moment-timezone');

module.exports = async (client, oldMessage, newMessage) => {
  // Ignore all bots and make sure the content of the message changed.
  if (!newMessage.guild || newMessage.author.bot || oldMessage.content === newMessage.content
      || client.config.ignoreChannel.includes(newMessage.channel.id)
      || client.config.ignoreMember.includes(newMessage.author.id)
      || newMessage.guild.id !== client.config.mainGuild) {
    return;
  }

  // Description value length limit for embeds is 1024
  const oldDemark = oldMessage.content.replace(/(\*|~|_|`)/g, '\\$1');
  const newDemark = newMessage.content.replace(/(\*|~|_|`)/g, '\\$1');
  const oldMsg = oldDemark.length > 499 ? `${oldDemark.slice(0, 496)}...` : oldDemark;
  const newMsg = newDemark.length > 499 ? `${newDemark.slice(0, 496)}...` : newDemark;

  const embed = new Discord.MessageEmbed()
    .setColor('#00e5ff')
    .setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL())
    .setDescription(`[Jump to message in](${newMessage.url} 'Jump') <#${newMessage.channel.id}>`)
    .setTimestamp()
    .setFooter(`ID: ${newMessage.author.id}`)
    .addField('**Message Edited**', `**Before:** ${oldMsg}\n**+After:** ${newMsg}`)
    .addField('**Posted**', moment.utc(oldMessage.createdAt).format('MMMM Do YYYY, HH:mm:ss z'));

  newMessage.guild.channels.cache.get(client.config.actionLog).send(embed);
};
