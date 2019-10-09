const Discord = require('discord.js');

module.exports = async (client, member) => {
  const serverAge = client.humanTimeBetween(Date.now(), member.joinedTimestamp);

  const roles = member.roles.filter((r) => r.id !== member.guild.id).map((r) => r.name).join(', ') || 'No Roles';
  const roleSize = member.roles.filter((r) => r.id !== member.guild.id).size;

  const embed = new Discord.RichEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL)
    .setColor('#ff07a9')
    .setTimestamp()
    .setFooter(`ID: ${member.id}`)
    .setThumbnail(member.user.displayAvatarURL)
    .addField('**Member Left**', `<@${member.id}>`, true)
    .addField('**Member For**', serverAge, true)
    .addField(`**Roles (${roleSize})**`, roles, true);

  member.guild.channels.get(client.getSettings(member.guild).actionLog).send(embed);
};
