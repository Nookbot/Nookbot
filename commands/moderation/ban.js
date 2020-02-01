// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  // Setting member to first member mentioned
  let member = message.mentions.members.first();

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

  // Sets reason shown in audit logs
  const reason = args[1] ? args.slice(1).join(' ') : 'No reason provided';

  // Bans the member
  return message.guild.ban(member, { reason }).then((memberBanned) => {
    // If ban is successful, display this
    client.success(message.channel, 'Ban Successful!', `I've successfully banned **${memberBanned.user.tag}**!`);
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
