// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  if (args[0] === 'delete' || args[0] === 'del' || args[0] === 'd'
      || args[0] === 'remove' || args[0] === 'rem' || args[0] === 'r') {
    const caseNum = args[1];

    if (client.headStaffNotesDB.has(caseNum)) {
      const userID = client.headStaffNotesDB.get(caseNum);
      // Remove the caseNum => userID entry in headStaffNotesDB
      client.headStaffNotesDB.delete(caseNum);
      // Remove the note from the user
      const notes = client.userDB.get(userID, 'headStaffNotes');
      client.userDB.set(userID, notes.filter((note) => note.case !== caseNum), 'headStaffNotes');
      // Notify that the note was removed
      const user = await client.users.fetch(userID);
      return client.success(message.channel, 'Note Removed!', `I've successfully removed note number **${caseNum}** from **${user.tag}**!`);
    }

    return client.error(message.channel, 'Invalid Case Number!', 'Please provide a valid case number to apply medicine to!');
  }

  let user;
  if (parseInt(args[0], 10)) {
    try {
      user = await client.users.fetch(args[0]);
    } catch (err) {
      return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
    }
  }

  const parseType = (input) => {
    if (input === 'note' || input === 'n') {
      return 'note';
    }

    if (input === 'warning' || input === 'warn' || input === 'w') {
      return 'warning';
    }

    if (input === 'absence' || input === 'a') {
      return 'absence';
    }

    return undefined;
  };

  const type = parseType(args[1]);
  if (!type) {
    return client.error(message.channel, 'Invalid Type!', 'Please specifiy the type of note you wish to make! Types include: `note (n)`, `warning (w)`, and `absence (a)`.');
  }

  const time = Date.now();
  const reason = args[2] ? args.slice(2).join(' ') : 'No reason provided.';

  // Create note in headStaffNotesDB for case number
  const caseNum = client.headStaffNotesDB.autonum.toString();
  client.headStaffNotesDB.set(caseNum, user.id);

  // Create note in userDB
  client.userDB.ensure(user.id, client.config.userDBDefaults);
  client.userDB.push(user.id, {
    case: caseNum,
    type,
    reason: `${reason}${message.attachments.size > 0 ? `\n${message.attachments.map((a) => `${a.url}`).join('\n')}` : ''}`,
    headStaffMember: message.author.id,
    date: time,
  }, 'headStaffNotes', true);

  // Notify in channel
  return client.success(message.channel, 'Note Applied!', `I've successfully applied a note of type \`${type}\` to **${user.tag}**!`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['n'],
  args: 3,
  permLevel: 'Head Mod',
};

module.exports.help = {
  name: 'note',
  category: 'misc',
  description: 'Manage notes applied by head staff.',
  usage: 'note <id> <type> <reason>',
  details: '<id> => The id of the member to apply a note to.\n<type> => The type of note to apply: note (n), warning (w), and absence (a).\n<reason> => The reason the note was applied. Supports attachments.',
};
