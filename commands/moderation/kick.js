// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  // Setting member to first member memntioned
  let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

  if (!member) {
    const searchedMember = client.searchMember(args[0]);
    if (searchedMember) {
      const decision = await client.reactPrompt(message, `Would you like to kick \`${searchedMember.user.tag}\`?`);
      if (decision) {
        member = searchedMember;
      } else {
        message.delete().catch((err) => console.error(err));
        return client.error(message.channel, 'Member Not Kicked!', 'The prompt timed out, or you selected no.');
      }
    }
  }

  // If no member mentioned, display this message
  if (!member) {
    return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
  }

  // If member can't be kicked, display this
  if (!member.kickable) {
    return client.error(message.channel, 'Member Not Kickable!', 'I cannot kick this user! Do they have a higher role? Do I have kick permissions? Are you trying to kick the owner?');
  }

  // Sets reason shown in audit logs
  const reason = args[1] ? args.slice(1).join(' ') : 'No reason provided';

  // Kicks the member
  await member.kick(reason).catch((error) => client.error(message.channel, 'Kick Failed!', `I've failed to kick this member! Error: ${error}`));
  // If kick is successful, display this
  return client.success(message.channel, 'Kick Successful!', `I've successfully kicked **${member.tag}**!`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['k'],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'kick',
  category: 'moderation',
  description: 'kicks the mentioned member. Can be used with or without a stated reason.',
  usage: 'kick <@member> <reason>',
  details: '<@member> => Any valid member of the server that does not have a higher role and is not the owner.\n<reason> => The reason for the kick. Totally optional.',
};
