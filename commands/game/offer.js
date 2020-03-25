const { findBestMatch: findBest } = require('string-similarity');

module.exports.run = async (client, message, args) => {
  if (args.length === 0) {
    // No villager name was given
    return client.error(message.channel, 'No Villager Name Given!', 'You must supply a villager name to be placed up for adoption!');
  }

  const villager = findBest(args.join(' '), client.villagerDB.keyArray()).bestMatch;
  if (villager.rating > 0.1) {
    const vilAdopters = client.villagerDB.get(villager.target).adopters.filter((m) => message.guild.members.cache.has(m));
    // Clear the list of members that are no longer on the server
    client.villagerDB.set(villager.target, vilAdopters, 'adopters');

    if (vilAdopters.length === 0) {
      return client.error(message.channel, 'No One On The List!', `Nobody is currently wishing to adopt **${villager.target}**, but thank you for offering!`);
    }

    const decision = await client.reactPrompt(message, `You are about to ping **${vilAdopters.length}** members of this server that wish to adopt **${villager.target}**.\n\n**WARNING: IF YOU CHOOSE TO PING AND DO NOT GIVE SOMEONE THE VILLAGER, YOU WILL BE GIVEN TEN STINGS!**\n\n**ONLY USE THIS COMMAND IF THE VILLAGER YOU ARE OFFERING IS IN BOXES MOVING OUT!**\n\nDo you wish to ping **${vilAdopters.length}** members?`);
    if (decision) {
      let msg = `The following members are looking to adopt **${villager.target}**:\nPosition - Member - Friend Code`;
      vilAdopters.forEach((memID, i) => {
        msg += `\n#${i + 1} - <@${memID}> - ${client.userDB.ensure(memID, client.config.userDBDefaults).friendcode || 'Ask'}`;
      });
      msg += '\nYou are ultimately responsible for how to choose someone to adopt your villager, whether it be first to respond, first on the list, by random, or your pick.';
      return message.channel.send(msg, { split: true });
    }
    return client.error(message.channel, 'Members Not Pinged!', `You either chose to not ping the **${vilAdopters.length}** members wishing to adopt **${villager.target}**, or the react prompt timed out.`);
  }
  return client.error(message.channel, 'Incorrect Villager Name!', 'Could not find a villager with that name!');
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['orphan'],
  permLevel: 'Verified',
  cooldown: 1800, // 30 minutes
};

module.exports.help = {
  name: 'offer',
  category: 'game',
  description: 'Allows members to offer a specific villager for adoption',
  usage: 'offer <villager name>',
  details: '<villager name> => Ping all the members that are asking for the villager you specifiy.',
};
