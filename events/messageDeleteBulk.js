const Discord = require('discord.js');

module.exports = async (client, messages) => {
  // Ignore all ignoreChannels
  if (client.config.ignoreChannel.includes(messages.first().channel.id)) {
    return;
  }

  const embed = new Discord.MessageEmbed()
    .setColor('#ff9292')
    .setTitle(`${messages.size} Messages Purged in #${messages.first().channel.name}`)
    .setTimestamp();

  const msgs = [];
  let msg = '';
  messages.forEach((m) => {
    const temp = `\n[${m.author.tag}]: ${m.content}`;
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
  client.asyncForEach(msgs, async (m, i) => {
    // Update the embed with the latest message and index count
    embed.setDescription(m).setFooter(`[${i + 1}/${msgs.length}]`);
    // Send the embed in the channel.
    await messages.first().guild.channels.cache.get(client.config.actionLog).send(embed);
  });
};
