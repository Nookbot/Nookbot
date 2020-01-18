const { findBestMatch: findBest } = require('string-similarity');

module.exports.run = (client, message, args) => {
  let villager;
  switch (args[0]) {
    case 'delete':
    case 'del':
    case 'd':
    case 'cancel':
    case 'remove':
      if (args.length === 1) {
        // No villager name was given
        return client.error(message.channel, 'No Villager Name Given!', 'You must supply a villager name to be removed from the adoption list for that villager!');
      }

      villager = findBest(args.slice(1).join(' '), client.villagerDB.keyArray()).bestMatch;
      if (villager.rating > 0.5) {
        // Remove user ID of author from the list of adopters for the given villager if they are on the list already
        if (client.villagerDB.getProp(villager.target, 'adopters').includes(message.author.id)) {
          client.villagerDB.removeFrom(villager.target, 'adopters', message.author.id);
          return client.success(message.channel, 'Removed from the List!', `Your name was removed from the list of members that wish to adopt **${villager.target}**!`);
        }
        return client.error(message.channel, 'Not on the List!', `You were not on the list to adopt **${villager.target}**!`);
      }
      return client.error(message.channel, 'Incorrect Villager Name!', 'Could not find a villager with that name!');
    case 'offer':
    case 'place':
    case 'orphan':
      if (args.length === 1) {
        // No villager name was given
        return client.error(message.channel, 'No Villager Name Given!', 'You must supply a villager name to be placed up for adoption!');
      }

      villager = findBest(args.slice(1).join(' '), client.villagerDB.keyArray()).bestMatch;
      if (villager.rating > 0.5) {
        const vilAdopters = client.villagerDB.get(villager.target).adopters.filter((m) => message.guild.members.has(m));
        // Clear the list of members that are no longer on the server
        client.villagerDB.set(villager.target, vilAdopters, 'adopters');

        if (vilAdopters.length === 0) {
          return client.error(message.channel, 'No one on the List!', `Nobody is currently wishing to adopt **${villager.target}**, but thank you for offering!`);
        }

        let msg = `The following members are looking to adopt **${villager.target}**:\nPosition - Member - Friend Code`;
        vilAdopters.forEach((memID, i) => {
          msg += `\n#${i + 1} - <@${memID}> - ${client.userDB.ensure(memID, client.config.userDBDefaults).friendcode || 'Ask'}`;
        });
        msg += '\nYou are ultimately responsible for how to choose someone to adopt your villager, whether it be first to respond, first on the list, by random, or your pick.';
        return message.channel.send(msg);
      }
      return client.error(message.channel, 'Incorrect Villager Name!', 'Could not find a villager with that name!');
    default:
      if (args.length === 0) {
        // No villager name was given
        return client.error(message.channel, 'No Villager Name Given!', 'You must supply a villager name to be added to the adoption list for that villager!');
      }

      villager = findBest(args.join(' '), client.villagerDB.keyArray()).bestMatch;
      if (villager.rating > 0.5) {
        const vilAdopters = client.villagerDB.get(villager.target).adopters;
        if (!vilAdopters.includes(message.author.id)) {
          // Add them to the list
          client.villagerDB.pushIn(villager.target, 'adopters', message.author.id);
          return client.success(message.channel, 'Added to the List!', `Your name was added to the list of members that wish to adopt **${villager.target}**, and you will be pinged when someone offers them for adoption!\n**Remember**: It is up to whoever is offering the villager who they give the villager to, and being first to respond or first on the list doesn't mean you will be given the villager.`);
        }
        return client.error(message.channel, 'Already on the List!', `Your name was already on the list to adopt **${villager.target}**!`);
      }
      return client.error(message.channel, 'Incorrect Villager Name!', 'Could not find a villager with that name!');
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['adopt', 'ad'],
  permLevel: 'Verified',
  cooldown: 30,
};

module.exports.help = {
  name: 'adopt',
  category: 'game',
  description: 'Allows members to be notified when a user puts a specific villager up for adoption',
  usage: 'adopt <offer|delete> <villager name>',
  details: '<villager name> => Signup to be pinged when the villager you specifiy is placed up for adoption.\n<offer> => Ping all the members that are asking for the villager you specifiy.\n<delete> => Remove yourself from the list of members to be pinged when the villager you specifiy is placed up for adoption.',
};
