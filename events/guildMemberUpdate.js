const Discord = require('discord.js');

module.exports = async (client, oldMember, newMember) => {
  if (oldMember.nickname !== newMember.nickname) {
    const embed = new Discord.RichEmbed()
      .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL)
      .setTimestamp()
      .setFooter(`ID: ${newMember.id}`)
      .addField('**Nickname Update**', `**Before:**${oldMember.nickname || oldMember.user.username}\n**+After:**${newMember.nickname || newMember.user.username}`);

    client.userDB.ensure(newMember.id, client.config.userDBDefaults);
    client.userDB.push(newMember.id, { timestamp: Date.now(), nickname: newMember.nickname }, 'nicknames');

    oldMember.guild.channels.get(client.getSettings(client.guilds.first()).actionLog).send(embed);
  }
};
