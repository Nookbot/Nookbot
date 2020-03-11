// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  // Sets the role to the Muted role
  const role = message.guild.roles.cache.find((r) => r.name === 'Muted');

  // Sets the member to the user mentioned
  let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

  if (!member) {
    const searchedMember = client.searchMember(args[0]);
    if (searchedMember) {
      const decision = await client.reactPrompt(message, `Would you like to mute \`${searchedMember.user.tag}\`?`);
      if (decision) {
        member = searchedMember;
      } else {
        message.delete().catch((err) => console.error(err));
        return client.error(message.channel, 'Member Not Muted!', 'The prompt timed out, or you selected no.');
      }
    }
  }

  // If no user mentioned, display this
  if (!member) {
    return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
  }

  // Adds the role to the member and deletes the message that initiated the command
  member.roles.add(role).catch((err) => console.error(err));
  message.delete().catch((err) => console.error(err));
  return message.channel.send(`Successfully muted ${member}!`).catch((err) => console.error(err));
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['m'],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'mute',
  category: 'moderation',
  description: 'Gives the mentioned user the Muted role',
  usage: 'mute <@user>',
  details: '<@user> => Any valid member of the server',
};
