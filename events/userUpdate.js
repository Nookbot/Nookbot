const Discord = require('discord.js');

module.exports = async (client, oldUser, newUser) => {
  if (oldUser.tag !== newUser.tag) {
    const embed = new Discord.RichEmbed()
      .setAuthor(newUser.tag, newUser.displayAvatarURL)
      .setTimestamp()
      .setFooter(`ID: ${newUser.id}`)
      .addField('**Username Update**', `**Before:**${oldUser.tag}\n**+After:**${newUser.tag}`);

    client.userDB.ensure(newUser.id, client.config.userDBDefaults);
    client.userDB.push(newUser.id, { timestamp: Date.now(), username: newUser.tag }, 'usernames');

    client.guilds.first().channels.get(client.getSettings(client.guilds.first()).actionLog).send(embed);
  }
};
