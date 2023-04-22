const Discord = require('discord.js');

module.exports = async (client, oldMessage, newMessage) => {
  // Ignore all bots and make sure the content of the message changed.
  if (!newMessage.inGuild() || newMessage.author.bot || oldMessage.content === newMessage.content
      || client.config.ignoreChannel.includes(newMessage.channelId)
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
    .setAuthor({ name: newMessage.author.tag, iconURL: newMessage.author.displayAvatarURL() })
    .setDescription(`[Jump to message in](${newMessage.url} 'Jump') <#${newMessage.channelId}>`)
    .setTimestamp()
    .setFooter({ text: `ID: ${newMessage.author.id}` })
    .addField('**Message Edited**', `**Before:** ${oldMsg}\n**+After:** ${newMsg}`)
    .addField('**Posted**', `<t:${Math.floor(oldMessage.createdTimestamp / 1000)}>`);

  newMessage.guild.channels.cache.get(client.config.actionLog).send({ embeds: [embed] });
};
