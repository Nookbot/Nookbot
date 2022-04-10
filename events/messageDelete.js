const Discord = require('discord.js');
const moment = require('moment-timezone');

module.exports = async (client, message) => {
  // Ignore all bots, ignoreMembers, and ignoreChannels
  if (message.author.bot || !message.inGuild() || client.config.ignoreChannel.includes(message.channelId)
      || client.config.ignoreMember.includes(message.author.id) || message.guildId !== client.config.mainGuild) {
    return;
  }

  // Description value length limit for embeds is 1024
  const msg = message.content.length > 1024 ? `${message.content.slice(0, 1021)}...` : message.content;

  const embed = new Discord.MessageEmbed()
    .setColor('#ff9292')
    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
    .setDescription(`[Jump to message in](https://discordapp.com/channels/${message.guildId}/${message.channelId} 'Jump') <#${message.channelId}>`)
    .setTimestamp()
    .setFooter({ text: `ID: ${message.author.id}` });

  if (msg.length !== 0) {
    embed.addField('**Message Deleted**', msg);
  }

  embed.addField('**Posted**', `<t:${Math.floor(message.createdTimestamp / 1000)}>`);

  if (message.attachments.size > 0) {
    const attachmentsData = client.attachmentDB.get(message.id);
    embed.addField('**Attachments Deleted**', attachmentsData ? attachmentsData.loggedAttachments.join('\n') : `${client.emoji.redX} Failed to fetch attachments data!`);
  }

  message.guild.channels.cache.get(client.config.actionLog).send({ embeds: [embed] });
};
