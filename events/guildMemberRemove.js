const Discord = require('discord.js');

module.exports = async (client, member) => {
  client.userDB.ensure(member.id, client.config.userDBDefaults);

  member.roles.cache.forEach((r) => {
    client.userDB.push(member.id, r.id, 'roles');
  });

  const serverAge = client.humanTimeBetween(Date.now(), member.joinedTimestamp);

  const rolesArray = member.roles.cache.filter((r) => r.id !== member.guild.id);
  const roles = rolesArray.map((r) => `<@&${r.id}>`).join(', ') || 'No Roles';

  // Role persistence
  rolesArray.forEach((r) => {
    // Check if it's managed, since we can't add those roles back with the bot later
    if (!r.managed) {
      client.userDB.push(member.id, r.id, 'roles');
    }
  });

  const embed = new Discord.MessageEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL())
    .setColor('#ff07a9')
    .setTimestamp()
    .setFooter(`ID: ${member.id}`)
    .setThumbnail(member.user.displayAvatarURL())
    .addField('**Member Left**', `<@${member.id}>`, true)
    .addField('**Member For**', serverAge, true)
    .addField(`**Roles (${rolesArray.size})**`, roles, true);

  member.guild.channels.cache.get(client.getSettings(member.guild).actionLog).send(embed);
};
