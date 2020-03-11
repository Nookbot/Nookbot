// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  // Setting member to first member mentioned
  let member = message.mentions.members.first();
  if (!member) {
    if (parseInt(args[0], 10)) {
      try {
        member = await client.users.fetch(args[0]);
      } catch (err) {
        // Don't need to send a message here
      }
    }
  }

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

  // If no user mentioned, display this
  if (!member) {
    return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
  }

  // Sets reason shown in audit logs
  const reason = args[1] ? args.slice(1).join(' ') : 'No reason provided.';

  try {
    const dmChannel = await member.createDM();
    await dmChannel.send(`You have been banned from the AC:NH server for the following reason:
**${reason}**
If you wish to appeal your ban, fill out this Google Form:
<https://forms.gle/jcoP8kd3My31x3Gu6>`);
  } catch (e) {
    client.error(message.guild.channels.cache.get(client.getSettings(message.guild).staffChat), 'Failed to Send DM to Member!', "I've failed to send a dm to the most recent member banned. They most likely had dms off.");
  }

  // Bans the member
  return message.guild.members.ban(member, { reason }).then((memberBanned) => {
    // If ban is successful, display this
    client.success(message.channel, 'Ban Successful!', `I've successfully banned **${memberBanned.guild ? memberBanned.user.tag : `${memberBanned.username}#${memberBanned.discriminator}` || memberBanned}**!`);
  }).catch((error) => client.error(message.channel, 'Ban Failed!', `I've failed to ban this member! ${error}`));
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
