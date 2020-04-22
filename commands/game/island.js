// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level, Discord) => {
  switch (args[0] && args[0].toLowerCase()) {
    case 'islandname':
    case 'island':
    case 'in':
    case 'townname':
    case 'tn': {
      if (args.length === 1) {
        return client.error(message.channel, 'No Island Name Given!', 'Please supply the name of your island!');
      }

      const name = args.slice(1).join(' ');
      if (name.length > 10) {
        return client.error(message.channel, 'Invalid Island Name!', 'Island names cannot be longer than 10 characters!');
      }

      client.userDB.set(message.author.id, name, 'island.islandName');

      return client.success(message.channel, 'Successfully set the name of your island!', `Island Name: **${name}**`);
    }
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
    case 'charname':
    case 'cn':
    case 'villagername':
    case 'vn':
    case 'islandername': {
      if (args.length === 1) {
        return client.error(message.channel, 'No Character Name Given!', 'Please supply the name of your character!');
      }

      // Assuming villager names ar capped to 10 characters
      const name = args.slice(1).join(' ');
      if (name.length > 10) {
        return client.error(message.channel, 'Invalid Character Name!', 'Character names cannot be longer than 10 characters!');
      }

      client.userDB.set(message.author.id, name, 'island.characterName');

      return client.success(message.channel, "Successfully set your character's name!", `Character Name: **${name}**`);
    }
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
    case 'sn': {
      if (args.length === 1) {
        return client.error(message.channel, 'No Switch Profile Name Given!', 'Please supply the name of your Switch profile!');
      }

      const name = args.slice(1).join(' ');
      if (name.length > 10) {
        return client.error(message.channel, 'Invalid Switch Profile Name!', 'Switch profile names cannot be longer than 10 characters!');
      }

      client.userDB.set(message.author.id, name, 'island.profileName');

      return client.success(message.channel, 'Successfully set your Switch profile name!', `Profile Name: **${name}**`);
    }
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
    case 'remove':
    case 'delete':
    case 'rm':
    case 'del':
    case 'clear':
    case 'clr':
    case 'mod': {
      let memberID;
      if (args[0].toLowerCase() === 'mod' && level >= 3) {
        // If the mod subcommand is used, grab the next arguement as a member
        let member = message.mentions.members.first();
        if (!member) {
          if (parseInt(args[1], 10)) {
            try {
              member = await client.users.fetch(args[1]);
            } catch (err) {
              // Don't need to send a message here
            }
          }
        }

        if (!member) {
          const searchedMember = client.searchMember(args[1]);
          if (searchedMember) {
            const decision = await client.reactPrompt(message, `Would you like to moderate \`${searchedMember.user.tag}\`'s island settings?`);
            if (decision) {
              member = searchedMember;
            } else {
              message.delete().catch((err) => console.error(err));
              return client.error(message.channel, 'Island Settings Not Moderated!', 'The prompt timed out, or you selected no.');
            }
          }
        }

        if (!member) {
          return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server to moderate their island settings!');
        }

        memberID = member.id;
      }

      if (!memberID) {
        memberID = message.author.id;
      }

      if ((args[0].toLowerCase() === 'mod' && level >= 3) ? args.length === 2 : args.length === 1) {
        return client.error(message.channel, 'No Value To Remove!', 'Please supply the value you would like to remove! (islandname/fruit/charactername/hemisphere/profilename/friendcode)');
      }
      switch ((args[0].toLowerCase() === 'mod' && level >= 3) ? args[2].toLowerCase() : args[1].toLowerCase()) {
        case 'islandname':
        case 'island':
        case 'in':
        case 'townname':
        case 'tn':
          client.userDB.set(memberID, '', 'island.islandName');
          return client.success(message.channel, 'Successfully cleared the name of your island!', 'To set your island name again, use `.island islandname <name>`!');
        case 'fruit':
        case 'fr':
        case 'f':
          client.userDB.set(memberID, '', 'island.fruit');
          return client.success(message.channel, "Successfully cleared your island's native fruit!", "To set your island's native fruit again, use `.island fruit <fruit>`!");
        case 'charactername':
        case 'character':
        case 'charname':
        case 'cn':
        case 'villagername':
        case 'vn':
        case 'islandername':
          client.userDB.set(memberID, '', 'island.characterName');
          return client.success(message.channel, "Successfully cleared your character's name!", "To set your character's name again, use `.island charactername <name>`!");
        case 'hemisphere':
        case 'hem':
        case 'hm':
        case 'hemi':
          client.userDB.set(memberID, '', 'island.hemisphere');
          return client.success(message.channel, 'Successfully cleared the hemisphere for your island!', 'To set the hemisphere for your island again, use `.island hemisphere <hemisphere>`!');
        case 'profilename':
        case 'profile':
        case 'pn':
        case 'switchname':
        case 'sn':
          client.userDB.set(memberID, '', 'island.profileName');
          return client.success(message.channel, 'Successfully cleared your Switch profile name!', 'To set your Switch profile name again, use `.island profilename <name>`!');
        case 'friendcode':
        case 'fc':
        case 'code':
          if (client.userDB.has(memberID, 'friendcode')) {
            client.userDB.delete(memberID, 'friendcode');
            return client.success(message.channel, 'Successfully cleared your Switch friend code!', 'To set your Switch friend code again, use `.island friendcode <code>`!');
          }
          return client.error(message.channel, 'No Friend Code To Remove!', 'You did not have a friend code in the database. You can set it by typing \`.fc set <code>\`!');
        case 'all':
        case 'every':
          client.userDB.set(memberID, {
            islandName: '',
            fruit: '',
            characterName: '',
            hemisphere: '',
            profileName: '',
          }, 'island');
          return client.success(message.channel, 'Successfully cleared your Switch profile name!', 'To set your Switch profile name again, use `.island profilename <name>`!');
        default:
          return client.error(message.channel, 'Invalid Value To Remove!', 'Please supply the value you would like to remove! (islandname/fruit/charactername/hemisphere/profilename/friendcode)');
      }
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
      if (friendcode) {
        msg.push(`Friend Code: **${friendcode}**`);
      }
      if (island.profileName) {
        msg.push(`Switch Profile Name: **${island.profileName}**`);
      }
      if (island.characterName) {
        msg.push(`Character Name: **${island.characterName}**`);
      }
      if (island.islandName) {
        msg.push(`Island Name: **${island.islandName}**`);
      }
      if (island.fruit) {
        msg.push(`Fruit: **${island.fruit}**`);
      }
      if (island.hemisphere) {
        msg.push(`Hemisphere: **${island.hemisphere}**`);
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
  blockedChannels: [
    '538938170822230026',
    '494376688877174785',
    '661330633510879274',
    '651611409272274954',
    '494467780293427200',
    '669696796024504341',
    '690093605821480980',
  ],
};

module.exports.help = {
  name: 'island',
  category: 'game',
  description: 'Island information display',
  usage: 'island <islandname|fruit|charactername|hemisphere|profilename|friendcode> <name|fruit|hemisphere|code>',
  details: '<islandname> => Set the name of your island.\n<fruit> => Set the fruit that is native on your island.\n<charactername> => Set the name of your character on the island.\n<hemisphere> => Set the hemisphere your island is in.\n<profilename> => Set the name of your Switch profile.\n<friendcode> => Set your Switch friendcode.',
};
