const Discord = require('discord.js');

module.exports = async (client, message) => {
  // Ignore all bots, ignoreMembers, and ignoreChannels
  if (message.author.bot || !message.guild || client.config.ignoreChannel.includes(message.channel.id)
      || client.config.ignoreMember.includes(message.author.id)) {
    return;
  }

  // Description value length limit for embeds is 1024
  const msg = message.content.length > 1024 ? `${message.content.slice(0, 1021)}...` : message.content;

  const embed = new Discord.MessageEmbed()
    .setColor('#ff9292')
    .setAuthor(message.author.tag, message.author.displayAvatarURL())
    .setDescription(`[Jump to message in](https://discordapp.com/channels/${message.guild.id}/${message.channel.id} 'Jump') <#${message.channel.id}>`)
    .setTimestamp()
    .setFooter(`ID: ${message.author.id}`);

  if (msg.length !== 0) {
    embed.addField('**Message Deleted**', msg);
  }

  if (message.attachments.size > 0) {
    let attachList = '';

    message.attachments.forEach((value) => {
      const fileSize = value.size > 1048576 ? `${(value.size / 1048576).toFixed(2)} MB` : `${(value.size / 1024).toFixed(2)} KB`;
      attachList += `\n${value.name} | ${fileSize}`;
    });

    if (attachList.length !== 0) {
      embed.addField('**Attachments Deleted**', attachList.slice(1));
    }
  }
  message.guild.channels.cache.get(client.getSettings(message.guild).actionLog).send(embed);
};
