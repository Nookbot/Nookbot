const Discord = require('discord.js');

module.exports = async (client, message) => {
  // Ignore all bots
  if (message.author.bot) {
    return;
  }

  // Description value length limit for embeds is 1024
  const msg = message.content.length > 1024 ? `${message.content.slice(0, 1021)}...` : message.content;

  const embed = new Discord.RichEmbed()
    .setColor('#dd5f53')
    .setAuthor(message.author.tag, message.author.displayAvatarURL)
    .setDescription(`[Jump to message in](https://discordapp.com/channels/${message.guild.id}/${message.channel.id} 'Jump') <#${message.channel.id}>`)
    .setTimestamp()
    .setFooter(`ID: ${message.author.id}`);

  if (msg.length !== 0) {
    embed.addField('**Message Deleted**', msg);
  }

  if (message.attachments.size > 0) {
    let attachList = '';

    message.attachments.forEach((value) => {
      const fileSize = value.filesize > 1048576 ? `${Math.floor(value.filesize / 1048576)} MB` : `${Math.floor(value.filesize / 1024)} KB`;
      attachList += `\n${value.filename} | ${fileSize}`;
    });

    if (attachList.length !== 0) {
      embed.addField('**Attachments Deleted**', attachList.slice(1));
    }
  }
  message.guild.channels.get(client.getSettings(message.guild).actionLog).send(embed);
};
