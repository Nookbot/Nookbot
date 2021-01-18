const Discord = require('discord.js');

module.exports = async (client, oldMember, newMember) => {
  if (newMember.guild.id !== client.config.mainGuild) {
    return;
  }

  const boostRole = '591085261346045983';
  const boostPersonalityRoles = [
    '660552716426280990',
    '678780639012716545',
    '628336683363860503',
    '678781963376787466',
    '678779852181995531',
    '651977656992137227',
    '653004110051803146',
    '675176078603714570',
  ];
  if (oldMember.roles.cache.has(boostRole) && !newMember.roles.cache.has(boostRole)) {
    const roleToRemove = newMember.roles.cache.find((role) => role.id === boostPersonalityRoles.find((id) => role.id === id));

    if (roleToRemove) {
      newMember.roles.remove(roleToRemove);
    }
  }

  if (oldMember.nickname !== newMember.nickname) {
    const embed = new Discord.MessageEmbed()
      .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL())
      .setTimestamp()
      .setColor('#00e5ff')
      .setFooter(`ID: ${newMember.id}`)
      .addField('**Nickname Update**', `**Before:**${oldMember.nickname ? oldMember.nickname.replace(/(\*|~|_|`|<|\|)/g, '\\$1') : oldMember.user.username.replace(/(\*|~|_|`|<|\|)/g, '\\$1')}
**+After:**${newMember.nickname ? newMember.nickname.replace(/(\*|~|_|`|<|\|)/g, '\\$1') : newMember.user.username.replace(/(\*|~|_|`|<|\|)/g, '\\$1')}`);

    client.userDB.ensure(newMember.id, client.config.userDBDefaults);
    client.userDB.push(newMember.id, { timestamp: Date.now(), nickname: newMember.nickname || newMember.user.username }, 'nicknames');

    oldMember.guild.channels.cache.get(client.config.actionLog).send(embed);
  }

  if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
    const mutedRoleOld = oldMember.roles.cache.get(client.config.mutedRole);
    const mutedRoleNew = newMember.roles.cache.get(client.config.mutedRole);
    if ((!mutedRoleOld && !mutedRoleNew) || (mutedRoleOld && mutedRoleNew)) {
      return;
    }

    const memberMuted = !!(!mutedRoleOld && mutedRoleNew);
    const embed = new Discord.MessageEmbed()
      .setAuthor(newMember.user.tag, newMember.user.displayAvatarURL())
      .setTimestamp()
      .setColor(memberMuted ? '#ff9292' : '#1de9b6')
      .setFooter(`ID: ${newMember.id}`)
      .addField(`**Member ${memberMuted ? 'Muted' : 'Unmuted'}**`, `<@${newMember.id}>`);

    oldMember.guild.channels.cache.get(client.config.modLog).send(embed);
  }
};
