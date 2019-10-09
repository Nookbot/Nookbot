// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  // Setting member to first member memntioned
  const member = message.mentions.members.first() || message.guild.members.get(args[0]);

  // If no member mentioned, display this message
  if (!member) {
    return message.error('Invalid Member!', 'Please mention a valid member of this server');
  }

  // If member can't be banned, display this
  if (!member.bannable) {
    return message.error('Member Not Bannable!', 'I cannot ban this user! Do they have a higher role? Do I have ban permissions? Are you trying to ban the owner?');
  }

  // Sets reason shown in audit logs
  const reason = args[1] ? args.slice(1).join(' ') : 'No reason provided';

  // Bans the member
  await member.ban(reason).catch((error) => message.error('Ban Failed!', `I've failed to ban this member! Error: ${error}`));
  // If ban is successful, display this
  return message.success('Ban Successful!', `I've successfully banned **${member.tag}**!`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: [],
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
