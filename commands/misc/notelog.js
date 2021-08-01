// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  let user;
  if (parseInt(args[0], 10)) {
    try {
      user = await client.users.fetch(args[0]);
    } catch (err) {
      return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
    }
  }


  const { headStaffNotes } = client.userDB.ensure(user.id, client.config.userDBDefaults);

  if (headStaffNotes.length === 0) {
    return client.error(message.channel, 'No Notes Found!', `I did not find any notes recorded for **${user.tag}**!`);
  }

  let msg = `__**•• Head Staff Notes for ${user.tag} ••**__`;

  headStaffNotes.sort((a, b) => {
    if (a.type === 'note') {
      if (b.type === 'note') {
        return 0;
      }
      return -1;
    }

    if (a.type === 'absence') {
      if (b.type === 'absence') {
        return 0;
      }
      if (b.type === 'warning') {
        return -1;
      }
      return 1;
    }

    if (b.type === a.type) {
      return 0;
    }

    return 1;
  });


  // eslint-disable-next-line array-callback-return
  headStaffNotes.map((n, i, arr) => {
    if (arr[i - 1]) {
      if (n.type !== arr[i - 1].type) {
        if (n.type === 'absence') {
          msg += '\n\n**Absences**';
        } else {
          msg += '\n\n**Warnings**';
        }
      }
    } else {
      msg += '\n**General Notes**';
    }

    const headStaffMember = client.users.cache.get(n.headStaffMember);
    msg += `\n• Case ${n.case} - ${headStaffMember ? `HM+: ${headStaffMember.tag}` : `Unknown HM+ ID: ${n.headStaffMember || 'No ID Stored'}`} - (<t:${Math.floor(new Date(n.date).getTime() / 1000)}>)\n> Reason: ${n.reason}`;
  });

  return message.channel.send(msg, { split: true });
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['notes', 'noteslog', 'nl'],
  args: 1,
  permLevel: 'Head Mod',
};

module.exports.help = {
  name: 'notelog',
  category: 'misc',
  description: '',
  usage: '',
  details: '',
};
