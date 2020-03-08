module.exports.run = async (client, message, args) => {
  const caseNum = parseInt(args[0], 10);

  if (!(caseNum > 0)) {
    return client.error(message.channel, 'Invalid Number!', 'Please provide a valid case number to apply medicine to!');
  }

  if (client.infractionDB.has(caseNum.toString())) {
    const userID = client.infractionDB.get(caseNum);
    // Remove the caseNum => userID entry in infractionDB
    client.infractionDB.delete(caseNum.toString());
    // Remove the infraction from the user
    const infs = client.userDB.get(userID, 'infractions');
    const infRemoved = infs.filter((inf) => inf.case === caseNum)[0];
    client.userDB.set(userID, infs.filter((inf) => inf.case !== caseNum), 'infractions');
    // Notify that the infraction was removed
    const user = await client.users.fetch(userID);
    return client.success(message.channel, 'Medicine Applied!', `**${user.tag}** was given medicine to cure **${infRemoved.points}** bee sting${infRemoved.points === 1 ? '' : 's'} from case number **${caseNum}**!`);
  }

  return client.error(message.channel, 'Invalid Case Number!', 'Please provide a valid case number to apply medicine to!');
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['beestingdel', 'beedel', 'bsdel', 'stingdel'],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'medicine',
  category: 'moderation',
  description: 'Remove bee stings on server members.',
  usage: 'Medicine <case number>',
  details: '<case number> => The case number for the sting to be removed.',
};
