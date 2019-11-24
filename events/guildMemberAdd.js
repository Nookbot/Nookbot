const Discord = require('discord.js');

module.exports = async (client, member) => {
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
    const inviter = client.users.get(invite.inviter.id);
    inviteField = `${invite.code} from ${inviter.tag} (${inviter.id}) with ${invite.uses}`;
  } else {
    // Vanity URL was used
    inviteField = 'Vanity URL';
  }

  const embed = new Discord.RichEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL)
    .setColor('#1de9b6')
    .setTimestamp()
    .setFooter(`ID: ${member.id}`)
    .setThumbnail(member.user.displayAvatarURL)
    .addField('**Member Joined**', `<@${member.id}>`, true)
    .addField('**Join Position**', member.guild.memberCount, true)
    .addField('**Account Age**', accountAge, true)
    .addField('**Invite Used**', inviteField, true);

  member.guild.channels.get(client.getSettings(member.guild).actionLog).send(embed);
};
