const { findBestMatch: findBest } = require('string-similarity');

module.exports.run = async (client, message, args) => {
  if (args.length === 0) {
    // No villager name was given
    return client.error(message.channel, 'No Villager Name Given!', 'You must supply a villager name to be placed up for adoption!');
  }

  const villager = findBest(args.slice(0, 2).join(' ').toProperCase(), client.villagerDB.keyArray()).bestMatch;
  if (villager.rating > 0.1) {
    const vilAdopters = client.villagerDB.get(villager.target, 'adopters').filter((m) => message.guild.members.cache.has(m));
    const curOffset = client.villagerDB.get(villager.target, 'offset');
    const pingOffset = Math.min(curOffset, Math.max(vilAdopters.length - 10, 0));

    // Clear the list of members that are no longer on the server
    client.villagerDB.set(villager.target, vilAdopters, 'adopters');

    if (vilAdopters.length === 0) {
      return client.error(message.channel, 'No One On The List!', `Nobody is currently wishing to adopt **${villager.target}**, but thank you for offering!`);
    }

    const decision = await client.reactPrompt(message, `**READ THIS**: If you are using this command just to check the number of people that want **${villager.target}**, **STOP**! Just use the \`.adopt check ${villager.target}\` command in <#549858839994826753>.\n\nDo you wish to ping **${vilAdopters.length > 10 ? `10 (+${vilAdopters.length - 10} not pinged)` : `${vilAdopters.length}`}** members that wish to adopt **${villager.target}**?`);
    if (decision) {
      if (curOffset !== 0 && curOffset + 10 >= vilAdopters.length) {
        client.villagerDB.set(villager.target, 0, 'offset');
      } else if (curOffset + 10 < vilAdopters.length) {
        client.villagerDB.math(villager.target, '+', 10, 'offset');
      }
      const msgArr = [];
      vilAdopters.slice(pingOffset, pingOffset + 10).forEach((memID, i) => {
        msgArr.push(`#${pingOffset + i + 1} - <@${memID}> - ${client.userDB.ensure(memID, client.config.userDBDefaults).friendcode || 'Ask'}`);
      });
      const extra = vilAdopters.length > 10 ? vilAdopters.length - 10 : 0;
      const msg = `The following members are looking to adopt **${villager.target}**:\nPosition - Member - Friend Code\n${msgArr.join('\n')}${extra !== 0 ? `\nAnd **${extra}** other${extra === 1 ? '' : 's'} not pinged due to the limit of 10 pinged members.` : ''}\nOffered by: <@${message.author.id}>\n•••••`;
      return message.channel.send(msg, { split: true });
    }
    return client.error(message.channel, 'Members Not Pinged!', `You either chose to not ping the **${vilAdopters.length > 10 ? `10 (+${vilAdopters.length - 10} not pinged)` : `${vilAdopters.length}`}** members wishing to adopt **${villager.target}**, or the react prompt timed out.`);
  }
  return client.error(message.channel, 'Incorrect Villager Name!', 'Could not find a villager with that name!');
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['orphan'],
  permLevel: 'User',
  cooldown: 1800, // 30 minutes
  allowedChannels: ['669696796024504341'],
};

module.exports.help = {
  name: 'offer',
  category: 'game',
  description: 'Allows members to offer a specific villager for adoption',
  usage: 'offer <villager name>',
  details: '<villager name> => Ping all the members that are asking for the villager you specifiy.',
};
