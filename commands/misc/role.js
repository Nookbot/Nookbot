// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  let roleName = args.join(' ').toProperCase();
  const locations = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania'];
  const pronouns = ['he/him', 'she/her', 'they/them'];
  const news = ['Game News', 'Event News', 'Server News'];
  const personalities = ['Cranky', 'Jock', 'Lazy', 'Normal', 'Peppy', 'Smug', 'Snooty', 'Uchi'];
  const giveaways = ['In-Game Giveaways', 'Giveaways (US)', 'Giveaways (Non-US)'];

  if (roleName.includes('/')) {
    roleName = roleName.toLowerCase();
  } else if (roleName.includes('giveaway')) {
    if (roleName.toLowerCase().includes('non')) {
      roleName = 'Giveaways (Non-US)';
    } else if (roleName.includes('game')) {
      roleName = 'In-Game Giveaways';
    } else {
      roleName = 'Giveaways (US)';
    }
  }

  const role = message.guild.roles.cache.find((r) => r.name === roleName);

  if (!role) {
    return client.error(message.channel, 'Invalid Role!', 'Please provide a valid role!');
  }

  if (message.member.roles.cache.has(role.id)) {
    return client.error(message.channel, 'You Already Have This Role!', `You already have the \`${roleName}\` role!`);
  }

  if (locations.some((l) => l === roleName)) {
    if (locations.some((l) => message.member.roles.cache.some((r) => r.name === l))) {
      return client.error(message.channel, 'Location Role Duplicate', 'You already have a location role!');
    }
  } else if (personalities.some((p) => p === roleName)) {
    for (let i = 0; i < personalities.length; i++) {
      const rl = message.guild.roles.cache.find((r) => r.name === personalities[i]);

      if (message.member.roles.cache.has(rl.id)) {
        message.member.roles.remove(rl);
        break;
      }
    }
  } else if (pronouns.every((p) => p !== roleName) && news.every((n) => n !== roleName) && giveaways.every((g) => g !== roleName)) {
    return client.error(message.channel, 'Role Not Self-Assignable', 'This role cannot be self-assigned!');
  }

  return message.member.roles.add(role).then(() => {
    client.success(message.channel, 'Success!', `I've successfully added the \`${roleName}\` to you!`);
  }).catch((err) => {
    client.error(message.channel, 'Error!', 'There appears to be an error! Contact the bot developers for assistance!');
    console.error(err);
  });
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['giveme', 'give', 'roleme'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'role',
  category: 'misc',
  description: 'Controls user roles',
  usage: 'role <rolename>',
  details: '<rolename> => The name of the role to give. (Has to be self-assignable).',
};
