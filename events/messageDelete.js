const Discord = require('discord.js');

module.exports = async (client, message) => {
  // Ignore all bots
  if (message.author.bot) {
    return;
  }

  // Description value length limit for embeds is 1024
  const msg = message.content.length > 1024 ? `${message.content.slice(0,1021)}...` : message.content.slice(0, 1024);

  const embed = new Discord.RichEmbed()
    .setColor('#ff9292')
    .setAuthor(message.author.tag, message.author.displayAvatarURL)
    .setDescription(`[Jump to message in](https://discordapp.com/channels/${message.guild.id}/${message.channel.id} 'Jump') <#${message.channel.id}>`)
    .setTimestamp()
    .setFooter(`ID: ${message.author.id}`)
    .addField('**Message Deleted**', msg);

  message.guild.channels.get(client.getSettings(message.guild).actionLog).send(embed);
};