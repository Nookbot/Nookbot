const Discord = require('discord.js');

module.exports = async (client, oldUser, newUser) => {
  if (oldUser.tag !== newUser.tag) {
    const embed = new Discord.MessageEmbed()
      .setAuthor({ name: newUser.tag, iconURL: newUser.displayAvatarURL() })
      .setTimestamp()
      .setColor('#00e5ff')
      .setFooter({ text: `ID: ${newUser.id}` })
      .addField('**Username Update**', `**Before:**${oldUser.tag.replace(/(\*|~|_|`|<|\|)/g, '\\$1')}
**+After:**${newUser.tag.replace(/(\*|~|_|`|<|\|)/g, '\\$1')}`);

    client.userDB.ensure(newUser.id, client.config.userDBDefaults);
    client.userDB.push(newUser.id, { timestamp: Date.now(), username: newUser.tag }, 'usernames');

    client.channels.cache.get(client.config.actionLog).send({ embeds: [embed] });
  }
};
