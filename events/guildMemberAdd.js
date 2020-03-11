const Discord = require('discord.js');

module.exports = async (client, member) => {
  // Raid checking
  // Add this member to the list of raid joins.
  client.raidJoins.push(member);

  // If raidJoins has 10 members in it, that means we had 10 joins in less than 10 seconds
  // and we need to active Raid Mode.
  if (!client.raidMode && client.raidJoins.length >= client.config.raidJoinCount) {
    client.raidModeActivate(member.guild);
  }

  // Set a timeout to remove them from the list after 10 seconds if not in raid mode.
  if (!client.raidMode) {
    setTimeout(() => {
      if (!client.raidMode) client.raidJoins.shift();
    }, client.config.raidJoinsPerSecond * 1000);
  } else {
    // We're in Raid Mode, don't make a fancy member join embed.
    return;
  }

  // Role persistence
  const storedMember = client.userDB.ensure(member.id, client.config.userDBDefaults);
  if (storedMember.roles.length !== 0) {
    storedMember.roles.forEach((r) => {
      const role = member.guild.roles.cache.get(r);
      if (!role.managed && role.id !== member.guild.id) {
        member.roles.add(role);
      }
    });
    client.userDB.setProp(member.id, 'roles', []);
  }

  const time = Date.now();
  let accountAge = client.humanTimeBetween(time, member.user.createdTimestamp);

  // 172,800,000 ms is 48 hours.
  if (time - member.user.createdTimestamp < 172800000) {
    accountAge = `${client.emoji.warning} **NEW ACCOUNT** ${client.emoji.warning} ${accountAge}`;
  }

  let inviteField = 'Unknown';
  // Check which invite was used.
  const guildInvites = await member.guild.fetchInvites();
  // Existing invites
  const ei = client.invites;
  // Update cached invites
  client.invites = guildInvites;
  // Discover which invite was used
  const invite = guildInvites.find((i) => {
    if (!ei.has(i.code)) {
      // This is a new code, check if it's used.
      return i.uses > 0;
    }
    // This is a cached code, check if it's uses increased.
    return ei.get(i.code).uses < i.uses;
  });
    // If invite isn't valid, that most likely means the vanity URL was used so default to it.
  if (invite) {
    // Inviter
    const inviter = client.users.cache.get(invite.inviter.id);
    inviteField = `${invite.code} from ${inviter.tag} (${inviter.id}) with ${invite.uses}`;
  } else {
    // Vanity URL was used
    inviteField = 'Vanity URL';
  }

  const embed = new Discord.MessageEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL())
    .setColor('#1de9b6')
    .setTimestamp()
    .setFooter(`ID: ${member.id}`)
    .setThumbnail(member.user.displayAvatarURL())
    .addField('**Member Joined**', `<@${member.id}>`, true)
    .addField('**Join Position**', member.guild.memberCount, true)
    .addField('**Account Age**', accountAge, true)
    .addField('**Invite Used**', inviteField, true);

  member.guild.channels.cache.get(client.getSettings(member.guild).actionLog).send(embed);
};
