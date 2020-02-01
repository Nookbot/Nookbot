// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  // Setting member to first member memntioned
  const user = message.mentions.users.first() || client.fetchUser(args[0]);
  let member = message.guild.fetchMember(user);

  if (!member) {
    const searchedMember = client.searchMember(args[0]);
    if (searchedMember) {
      const decision = await client.reactPrompt(message, `Would you like to ban \`${searchedMember.user.tag}\`?`);
      if (decision) {
        member = searchedMember;
      } else {
        message.delete().catch((err) => console.error(err));
        return client.error(message.channel, 'Member Not Banned!', 'The prompt timed out, or you selected no.');
      }
    }
  }

  // If no member mentioned, display this message
  if (!member) {
    return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
  }

  // If member can't be banned, display this
  if (!member.bannable) {
    return client.error(message.channel, 'Member Not Bannable!', 'I cannot ban this user! Do they have a higher role? Do I have ban permissions? Are you trying to ban the owner?');
  }

  // Sets reason shown in audit logs
  const reason = args[1] ? args.slice(1).join(' ') : 'No reason provided';

  // Bans the member
  return member.ban(reason).then(() => {
    // If ban is successful, display this
    client.success(message.channel, 'Ban Successful!', `I've successfully banned **${member.user.tag}**!`);
  }).catch((error) => client.error(message.channel, 'Ban Failed!', `I've failed to ban this member! Error: ${error}`));
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['b'],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'ban',
  category: 'moderation',
  description: 'Bans the mentioned member. Can be used with or without a stated reason.',
  usage: 'ban <@member> <reason>',
  details: '<@member> => Any valid member of the server that does not have a higher role and is not the owner.\n<reason> => The reason for the ban. Totally optional.',
};
