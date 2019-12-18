const Discord = require('discord.js');

module.exports = async (client, oldUser, newUser) => {
  console.log(`userUpdate Event:\noldUser: ${oldUser.tag} | ${oldUser.username} ${oldUser.discriminator}\nnewUser: ${newUser.tag} | ${newUser.username} ${newUser.discriminator}`)
  if (oldUser.username !== newUser.username || oldUser.discriminator !== newUser.discriminator) {
    const embed = new Discord.RichEmbed()
      .setAuthor(newUser.tag, newUser.displayAvatarURL)
      .setTimestamp()
      .setColor('#00e5ff')
      .setFooter(`ID: ${newUser.id}`)
      .addField('**Username Update**', `**Before:**${oldUser.username}#${oldUser.discriminator}\n**+After:**${newUser.username}#${newUser.discriminator}`);

    client.userDB.ensure(newUser.id, client.config.userDBDefaults);
    client.userDB.push(newUser.id, { timestamp: Date.now(), username: newUser.tag }, 'usernames');

    client.guilds.first().channels.get(client.getSettings(client.guilds.first()).actionLog).send(embed);
  }
};
