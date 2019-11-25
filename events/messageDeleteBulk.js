const Discord = require('discord.js');

module.exports = async (client, messages) => {
  let embed = new Discord.RichEmbed()
    .setColor('#ff9292')
    .setTitle(`${messages.length} Messages Purged in #${messages.first().channel.name}`)
    .setTimestamp();
  
  let msgs = [];
  let msg = '';
  messages.forEach(m => {
    const temp = `[${m.author.tag}]: ${m.content}\n`;
    if (msg.length + temp.length < 2048) {
      msg += temp;
    } else {
      // Store this full message in our list
      msgs.push(msg.trim());
      // Start new msg with what wouldn't fit
      msg = temp;
    }
  });
  // Push the final message in to the list
  msgs.push(msg.trim());
  // Go through our list of messages to send, and send each of them.
  client.asyncForEach(msgs, (m, i) => {
    // Update the embed with the latest message and index count
    embed.setDescription(m).setFooter(`[${i+1}/${msgs.length}]`);
    // Send the embed in the channel.
    await messages.first().guild.channels.get(client.getSettings(message.guild).actionLog).send(embed);
  });
};