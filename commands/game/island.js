// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level, Discord) => {
  switch (args[0]) {
    case 'islandname':
    case 'island':
    case 'in':
    case 'townname':
    case 'tn':
      if (args.length === 1) {
        return client.error(message.channel, 'No Island Name Given!', 'Please supply the name of your island!');
      }

      if (args[1].length > 10) {
        return client.error(message.channel, 'Invalid Island Name!', 'Island names cannot be longer than 10 characters!');
      }

      client.userDB.set(message.author.id, args[1], 'island.islandName');

      return client.success(message.channel, 'Successfully set the name of your island!', `Island Name: **${args[1]}**`);
    case 'fruit':
    case 'fr':
    case 'f': {
      if (args.length === 1) {
        return client.error(message.channel, 'No Fruit Given!', 'Please supply the name of the fruit that is native to your island!');
      }

      let fruit;
      if (/apples?/i.test(args[1])) {
        fruit = 'Apples';
      } else if (/cherr(y|ies)/i.test(args[1])) {
        fruit = 'Cherries';
      } else if (/oranges?/i.test(args[1])) {
        fruit = 'Oranges';
      } else if (/peach(es)?/i.test(args[1])) {
        fruit = 'Peaches';
      } else if (/pears?/i.test(args[1])) {
        fruit = 'Pears';
      }

      if (!fruit) {
        return client.error(message.channel, 'Invalid Fruit!', "Your island's native fruit must be one of apples, cherries, oranges, peaches, or pears!");
      }

      client.userDB.set(message.author.id, fruit, 'island.fruit');

      return client.success(message.channel, "Successfully set your island's native fruit!", `Fruit: **${fruit}**`);
    }
    case 'charactername':
    case 'character':
    case 'cn':
    case 'villagername':
    case 'vn':
    case 'islandername':
      if (args.length === 1) {
        return client.error(message.channel, 'No Character Name Given!', 'Please supply the name of your character!');
      }

      // Assuming villager names ar capped to 10 characters
      if (args[1].length > 10) {
        return client.error(message.channel, 'Invalid Character Name!', 'Character names cannot be longer than 10 characters!');
      }

      client.userDB.set(message.author.id, args[1], 'island.characterName');

      return client.success(message.channel, "Successfully set your character's name!", `Character Name: **${args[1]}**`);
    case 'hemisphere':
    case 'hem':
    case 'hm':
    case 'hemi': {
      if (args.length === 1) {
        return client.error(message.channel, 'No Hemisphere Given!', 'Please supply the hemisphere your island is in, either northern or southern!');
      }

      let hemisphere;
      if (/north(ern)?/i.test(args[1])) {
        hemisphere = 'Northern';
      } else if (/south(ern)?/i.test(args[1])) {
        hemisphere = 'Southern';
      }

      if (!hemisphere) {
        return client.error(message.channel, 'Invalid Hemisphere!', 'The hemisphere must be either northern or southern!');
      }

      client.userDB.set(message.author.id, hemisphere, 'island.hemisphere');

      return client.success(message.channel, 'Successfully set the hemisphere for your island!', `Hemisphere: **${hemisphere}**`);
    }
    case 'profilename':
    case 'profile':
    case 'pn':
    case 'switchname':
    case 'sn':
      if (args.length === 1) {
        return client.error(message.channel, 'No Switch Profile Name Given!', 'Please supply the name of your Switch profile!');
      }

      if (args[1].length > 10) {
        return client.error(message.channel, 'Invalid Switch Profile Name!', 'Switch profile names cannot be longer than 10 characters!');
      }

      client.userDB.set(message.author.id, args[1], 'island.profileName');

      return client.success(message.channel, 'Successfully set your Switch profile name!', `Profile Name: **${args[1]}**`);
    case 'friendcode':
    case 'fc':
    case 'code': {
      if (args.length === 1) {
        return client.error(message.channel, 'No Code Given!', 'Please supply your Switch friend code!');
      }

      let code = args.slice(1).join().replace(/[\D]/g, '');

      if (code.length !== 12) {
        return client.error(message.channel, 'Invalid Code!', 'The code must have 12 digits!');
      }

      code = `SW-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
      client.userDB.set(message.author.id, code, 'friendcode');

      return client.success(message.channel, 'Successfully set your Switch friend code!', `Friend Code: **${code}**`);
    }
    default: {
      let member;
      if (args.length === 0) {
        member = message.member;
      } else {
        member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || client.searchMember(args.join(' '));
        if (!member) {
          return client.error(message.channel, 'Unknown Member!', 'Could not find a member by that name!');
        }
      }

      // Return user's island information if they have any stored
      const { friendcode, island } = client.userDB.ensure(member.id, client.config.userDBDefaults);

      const msg = [];
      if (island.islandName) {
        msg.push(`Island Name: **${island.islandName}**`);
      }
      if (island.fruit) {
        msg.push(`Fruit: **${island.fruit}**`);
      }
      if (island.characterName) {
        msg.push(`Character Name: **${island.characterName}**`);
      }
      if (island.hemisphere) {
        msg.push(`Hemisphere: **${island.hemisphere}**`);
      }
      if (island.profileName) {
        msg.push(`Profile Name: **${island.profileName}**`);
      }
      if (friendcode) {
        msg.push(`Friend Code: **${friendcode}**`);
      }

      if (msg.length === 0) {
        if (member.id === message.author.id) {
          return client.error(message.channel, 'No Island Information Found!', 'You have not supplied any information about your island! You can do so by running \`.island <islandname|fruit|charactername|hemisphere|profilename|friendcode> <name|fruit|hemisphere|code>\` with any of the options. Ex. \`.island fruit pears\`.');
        }
        return client.error(message.channel, 'No Island Information Found!', `${member.displayName} has not supplied any information about their island!`);
      }

      const embed = new Discord.MessageEmbed()
        .setAuthor(`${member.displayName}'s Island`, member.user.displayAvatarURL())
        .setColor('#0ba47d')
        .setDescription(`${msg.join('\n')}`);

      return message.channel.send(embed);
    }
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['is'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'island',
  category: 'game',
  description: 'Island information display',
  usage: 'island <islandname|fruit|charactername|hemisphere|profilename|friendcode> <name|fruit|hemisphere|code>',
  details: '<islandname> => Set the name of your island.\n<fruit> => Set the fruit that is native on your island.\n<charactername> => Set the name of your character on the island.\n<hemisphere> => Set the hemisphere your island is in.\n<profilename> => Set the name of your Switch profile.\n<friendcode> => Set your Switch friendcode.',
};
