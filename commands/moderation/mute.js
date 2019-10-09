// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  // Sets the role to the Brick Block role
  const role = message.guild.roles.find((r) => r.name === 'Muted');

  // Sets the member to the user mentioned
  const member = message.mentions.members.first();

  // If no user mentioned, display this
  if (!member) {
    return message.error('Invalid Member!', 'Please mention a valid member of this server');
  }

  // Adds the role to the member and deletes the message that initiated the command
  member.addRole(role).catch((err) => console.error(err));
  message.delete().catch((err) => console.error(err));
  return message.author.send(`Successfully muted ${member}!`).catch((err) => console.error(err));
};

module.exports.conf = {
  guildOnly: true,
  aliases: [],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'mute',
  category: 'moderation',
  description: 'Gives the mentioned user the Brick Block role',
  usage: 'mute <@user>',
  details: '<@user> => Any valid member of the server',
};
