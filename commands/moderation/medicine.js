module.exports.run = async (client, message, args, level) => {
  const medCase = (caseNum) => {
    const userID = client.infractionDB.get(caseNum);
    // Remove the caseNum => userID entry in infractionDB
    client.infractionDB.delete(caseNum.toString());
    // Remove the infraction from the user
    const infs = client.userDB.get(userID, 'infractions');
    // eslint-disable-next-line eqeqeq
    const infRemoved = infs.filter((inf) => inf.case == caseNum)[0];
    // eslint-disable-next-line eqeqeq
    client.userDB.set(userID, infs.filter((inf) => inf.case != caseNum), 'infractions');
    return { infRemoved, userID };
  };

  const num = args[0];
  if (!parseInt(num, 10)) {
    return client.error(message.channel, 'Invalid Number!', 'Please provide a valid case number or user ID to apply medicine to!');
  }

  const userFromDB = client.userDB.get(num);
  if (userFromDB) {
    if (level < 6) {
      return client.error(message.channel, 'Invalid Permissions!', 'You do not have the proper permissions to cure all bee stings!');
    }

    for (let i = 0; i < userFromDB.infractions.length; i++) {
      medCase(userFromDB.infractions[i].case);
    }

    const user = await client.users.fetch(num);
    return client.success(message.channel, 'Medicine Applied!', `**${user.tag}** has been cleared of all bee stings!`);
  }

  if (!client.infractionDB.has(num || parseInt(num, 10))) {
    return client.error(message.channel, 'Invalid Case Number!', 'Please provide a valid case number to apply medicine to!');
  }

  // Med the case
  const meddedCase = medCase(num);

  // Notify that the infraction was removed
  const user = await client.users.fetch(meddedCase.userID);
  return client.success(message.channel, 'Medicine Applied!', `**${user.tag}** was given medicine to cure **${meddedCase.infRemoved.points}** bee sting${meddedCase.infRemoved.points === 1 ? '' : 's'} from case number **${num}**!`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['beestingdel', 'beedel', 'bsdel', 'stingdel', 'med', 'cure'],
  permLevel: 'Head Redd',
  args: 1,
};

module.exports.help = {
  name: 'medicine',
  category: 'moderation',
  description: 'Remove bee stings on server members.',
  usage: 'Medicine <case number>',
  details: '<case number> => The case number for the sting to be removed.',
};
