const { findBestMatch: findBest } = require('string-similarity');

module.exports.run = (client, message, args) => {
  let vilName;
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

      vilName = findBest(args.slice(1).join(' '), client.villagerDB.map((v, k) => k)).bestMatch.target;
      // Should make this less picky and do a search through the list of villager names for the closest match within a threshold
      if (client.villagerDB.has(vilName)) {
        // Remove user ID of author from the list of adopters for the given villager if they are on the list already
        const vilAdopters = client.villagerDB.get(vilName).adopters;
        const i = vilAdopters.indexOf(message.author.id);
        if (i !== -1) {
          // Check if Enmap has a convienence function to remove a single element from an array prop
          client.villagerDB.set(vilName, adopters.splice(i, 1), 'adopters');
          return client.success(message.channel, 'Removed from the List!', `Your name was removed from the list of members that wish to adopt ${vilName}!`);
        }
        return client.error(message.channel, 'Not on the List!', `You were not on the list to adopt ${vilName}!`);
      }
      return client.error(message.channel, 'Incorrect Villager Name!', 'Could not find a villager with that name!');
    case 'offer':
    case 'place':
    case 'orphan':
      if (args.length === 1) {
        // No villager name was given
        return client.error(message.channel, 'No Villager Name Given!', 'You must supply a villager name to be placed up for adoption!');
      }

      vilName = findBest(args.slice(1).join(' '), client.villagerDB.map((v, k) => k)).bestMatch.target;
      if (client.villagerDB.has(vilName)) {
        const vilAdopters = client.villagerDB.get(vilName).adopters.filter((m) => message.guild.members.includes(m));
        // Clear the list of members that are no longer on the server
        client.villagerDB.set(vilName, vilAdopters, 'adopters');

        if (vilAdopters.length === 0) {
          return client.error(message.channel, 'No one on the List!', `Nobody is currently wishing to adopt ${vilName}, but thank you for offering!`);
        }

        let msg = `The following members are looking to adopt ${vilName}:\nPosition - Member - Friend Code`;
        vilAdopters.forEach((memID, i) => {
          msg += `\n#${i + 1} - @${memID} - ${client.userDB.ensure(memID, client.config.userDBDefaults).friendcode || 'Ask'}`;
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

      vilName = findBest(args.join(' '), client.villagerDB.map((v, k) => k)).bestMatch.target;
      if (client.villagerDB.has(vilName)) {
        const vilAdopters = client.villagerDB.get(vilName).adopters;
        if (!vilAdopters.includes(message.author.id)) {
          // Add them to the list
          vilAdopters.push(message.author.id);
          return client.success(message.channel, 'Added to the List!', `Your name was added to the list of members that wish to adopt ${vilName}, and you will be pinged when someone offers them for adoption!\n**Remember**: It is up to whoever is offering the villager who they give the villager to, and being first to respond or first on the list doesn't mean you will be given the villager.`);
        }
        return client.error(message.channel, 'Already on the List!', `Your name was already on the list to adopt ${vilName}`);
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
  description: "Allows members to be notified when a user puts a specific villager up for adoption",
  usage: 'adopt <offer|delete> <villager name>',
  details: '<villager name> => Signup to be pinged when the villager you specifiy is placed up for adoption.\n<offer> => Ping all the members that are asking for the villager you specifiy.\n<delete> => Remove yourself from the list of members to be pinged when the villager you specifiy is placed up for adoption.',
};
`
Questions:
Output when added to a list mentioning quick rules?
What channel to allow users to apply and offer villagers in?
Should we give tips on how to choose members to pick for adoption?
Implement rules against real money trading for villagers?
How long of a cooldown on the adopt command?
Separate offer command to make the cooldown longer?

.eval const fs = require('fs');
const vfile = fs.open('filename.json');
vfile.forEach((v) => {
const vobj = {birthday: v.birthday, adopters: []};
client.villagerDB.set(v.name, vobj);
});
`