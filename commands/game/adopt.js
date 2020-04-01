const { findBestMatch: findBest } = require('string-similarity');

module.exports.run = (client, message, args) => {
  switch (args[0] && args[0].toLowerCase()) {
    case 'list':
    case 'l':
    case 'show': {
      const msg = [];
      client.villagerDB.map((v, k) => ({ name: k, adopters: v.adopters })).forEach((v) => {
        if (v.adopters.includes(message.author.id)) {
          msg.push(v.name);
        }
      });

      if (msg.length > 0) {
        return message.channel.send(`You are on the list to adopt the following villagers:\n${msg.join(', ')}.`, { split: true });
      }
      return client.error(message.channel, 'Not Signed Up!', 'You are not signed up to adopt any villagers!\nYou can sign up to adopt any villager by using the `.adopt <villager name>` command.');
    }
    case 'delete':
    case 'd':
    case 'cancel':
    case 'remove': {
      if (args.length === 1) {
        // No villager name was given
        return client.error(message.channel, 'No Villager Name Given!', 'You must supply a villager name to be removed from the adoption list for that villager!');
      }

      const villager = findBest(args.slice(1).join(' ').toProperCase(), client.villagerDB.keyArray()).bestMatch;
      if (villager.rating > 0.1) {
        // Remove user ID of author from the list of adopters for the given villager if they are on the list already
        if (client.villagerDB.getProp(villager.target, 'adopters').includes(message.author.id)) {
          client.villagerDB.removeFrom(villager.target, 'adopters', message.author.id);
          return client.success(message.channel, 'Removed from the List!', `Your name was removed from the list of members that wish to adopt **${villager.target}**!`);
        }
        return client.error(message.channel, 'Not on the List!', `You were not on the list to adopt **${villager.target}**!`);
      }
      return client.error(message.channel, 'Incorrect Villager Name!', 'Could not find a villager with that name!');
    }
    case 'check':
    case 'peek': {
      if (args.length === 1) {
        // No villager name was given
        return client.error(message.channel, 'No Villager Name Given!', 'You must supply a villager name to check the adoption list for that villager!');
      }

      const villager = findBest(args.slice(1).join(' ').toProperCase(), client.villagerDB.keyArray()).bestMatch;
      if (villager.rating > 0.1) {
        const vilAdoptersLength = client.villagerDB.getProp(villager.target, 'adopters').length;
        if (vilAdoptersLength > 0) {
          return message.channel.send(`There are **${vilAdoptersLength}** members who wish to adopt **${villager.target}**!`);
        }
        return message.channel.send(`No one is currently on the list to adopt **${villager.target}**!`);
      }
      return client.error(message.channel, 'Incorrect Villager Name!', 'Could not find a villager with that name!');
    }
    default: {
      if (args.length === 0) {
        // No villager name was given
        return client.error(message.channel, 'No Villager Name Given!', 'You must supply a villager name to be added to the adoption list for that villager!');
      }

      const villager = findBest(args.join(' ').toProperCase(), client.villagerDB.keyArray()).bestMatch;
      if (villager.rating > 0.1) {
        const vilAdopters = client.villagerDB.get(villager.target).adopters;
        if (!vilAdopters.includes(message.author.id)) {
          // Add them to the list
          client.villagerDB.pushIn(villager.target, 'adopters', message.author.id);
          return client.success(message.channel, 'Added to the List!', `You will be pinged when someone offers **${villager.target}** for adoption!`);
        }
        return client.error(message.channel, 'Already on the List!', `Your name was already on the list to adopt **${villager.target}**!`);
      }
      return client.error(message.channel, 'Incorrect Villager Name!', 'Could not find a villager with that name!');
    }
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['ad'],
  permLevel: 'User',
  allowedChannels: ['549858839994826753'],
};

module.exports.help = {
  name: 'adopt',
  category: 'game',
  description: 'Allows members to be notified when a user puts a specific villager up for adoption',
  usage: 'adopt <delete|list> <villager name>',
  details: '<villager name> => Signup to be pinged when the villager you specifiy is placed up for adoption.\n<delete> => Remove yourself from the list of members to be pinged when the villager you specifiy is placed up for adoption.\n<list> => Lists all of the villagers that you have signed up to adopt.',
};
