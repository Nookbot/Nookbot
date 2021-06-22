// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line consistent-return

module.exports.run = async (client, message, args, level) => {
  let num0 = parseInt(args[0], 10);
  let num1 = parseInt(args[1], 10);
  let msg = '';
  const sheetDBSize = client.mmSignUp.count - 1;

  if (level < 6 && !client.config.copperBookerLeads.includes(message.author.id)) {
    const { hours } = client.mmSignUp.get(message.member.id);

    // Try to send DM
    try {
      const dmChannel = await message.member.createDM();

      if ((!hours && hours !== 0)) {
        return client.error(dmChannel, 'No Middleman Found!', 'You were not found in the database!');
      }

      await dmChannel.send(`**Middleman Sign Up Statistics**\nName - Hours\n**${message.member.displayName}** (${message.member.id}) - \`${hours} hours\``);
      return client.success(message.channel, 'Hours Sent!', "I've successfully sent you your current hours for the week!");
    } catch (e) {
      return client.error(message.channel, 'Failed to DM Hours!', "I've failed to DM your hours! Please ensure you have your DMs open!");
    }
  } else {
    switch (args[0]) {
      case 't':
      case 'top': {
        if (Number.isNaN(num1) || num1 <= 0) {
          return client.error(message.channel, 'Not a Number!', 'You must supply a number for the amount of top ranked middlemen to display.');
        }

        const mm = client.mmSignUp.map((v, k) => ({ id: k, hours: v.hours }))
          .sort((a, b) => b.hours - a.hours)
          .slice(0, num1);

        await client.asyncForEach(mm, async (e, i) => {
          if (e.id !== 'data') {
            const mmMember = await message.guild.members.fetch(e.id) || 'Unknown MM';
            msg += `\n#${i + 1} - **${mmMember.displayName}** (${e.id}) - \`${e.hours} hours\``;
          }
        });

        if (!msg) {
          return client.error(message.channel, 'No Matches!', 'No middlemen matched your search critera!');
        }
        return message.channel.send(`**Middleman Sign Up Statistics**\nRank - Name - Hours${msg}`, { split: true });
      }
      case 'b':
      case 'bottom': {
        if (Number.isNaN(num1) || num1 <= 0) {
          return client.error(message.channel, 'Not a Number!', 'You must supply a number for the amount of bottom ranked middlemen to display.');
        }

        const mods = client.mmSignUp.map((v, k) => ({ id: k, hours: v.hours }))
          .sort((a, b) => b.hours - a.hours)
          .slice(-num1);

        await client.asyncForEach(mods, async (e, i) => {
          if (e.id !== 'data') {
            const mmMember = await message.guild.members.fetch(e.id);
            msg += `\n#${sheetDBSize - num1 + i + 1} - **${mmMember.displayName}** (${e.id}) - \`${e.hours} hours\``;
          }
        });

        if (!msg) {
          return client.error(message.channel, 'No Matches!', 'No middlemen matched your search critera!');
        }
        return message.channel.send(`**Middleman Sign Up Statistics**\nRank - Name - Hours${msg}`, { split: true });
      }
      case 'remove':
      case 'delete':
      case 'r':
      case 'd':
        // eslint-disable-next-line no-restricted-globals
        if (!client.mmSignUp.has(args[1]) || isNaN(args[1])) {
          return client.error(message.channel, 'Middleman Not Found!', 'The middleman was not found in the database and therefore cannot be removed!');
        }

        client.mmSignUp.delete(args[1]);
        return client.success(message.channel, 'Successfully Removed from the Database!', `I've successfully removed <@${args[1]}> \`(${args[1]})\` from the mm reaction signup database!`);
      case 'set':
      case 's': {
        const hoursToSet = parseFloat(args[2]);
        // eslint-disable-next-line no-restricted-globals
        if (!client.mmSignUp.has(args[1]) || isNaN(args[1])) {
          return client.error(message.channel, 'Middleman Not Found!', 'The middleman was not found in the database and therefore hours could not be set!');
        }

        if (hoursToSet) {
          return client.error(message.channel, 'Invalid Hours!', 'Please provide a valid number of hours!');
        }

        client.mmSignUp.set(args[1], hoursToSet, 'hours');
        return client.success(message.channel, 'Successfully Set Hours!', `I've successfully set <@${args[1]}>'s hours to \`${hoursToSet} hours\`!`);
      }
      default: {
        if (args.length === 2 && Number.isInteger(num0) && Number.isInteger(num1)) {
          if (num0 <= 0 || num1 <= 0) {
            return client.error(message.channel, 'Invalid Numbers!', 'The numbers provided must be greater than 0.');
          }

          if (num1 > num0) {
            const temp = num0;
            num0 = num1;
            num1 = temp;
          }

          const mm = client.mmSignUp.map((v, k) => ({ id: k, hours: v.hours }))
            .sort((a, b) => b.hours - a.hours)
            .slice(num1 - 1, num0);

          await client.asyncForEach(mm, async (e, i) => {
            if (e.id !== 'data') {
              const mmMember = await message.guild.members.fetch(e.id) || 'Unknown MM';
              msg += `\n#${num1 + i} - **${mmMember.displayName}** (${e.id}) - \`${e.hours} hours\``;
            }
          });

          if (!msg) {
            return client.error(message.channel, 'No Matches!', 'No middlemen matched your search critera!');
          }
          return message.channel.send(`**Middleman Sign Up Statistics**\nRank - Name - Hours${msg}`, { split: true });
        }

        if (args.length === 0) {
          const { hours } = client.mmSignUp.get(message.member.id);
          // Try to send DM
          try {
            const dmChannel = await message.member.createDM();

            if ((!hours && hours !== 0)) {
              return client.error(dmChannel, 'No Middleman Found!', 'You were not found in the database!');
            }

            await dmChannel.send(`**Middleman Sign Up Statistics**\nName - Hours\n**${message.member.displayName}** (${message.member.id}) - \`${hours} hours\``);
            return client.success(message.channel, 'Hours Sent!', "I've successfully sent you your current hours for the week!");
          } catch (e) {
            return client.error(message.channel, 'Failed to DM Hours!', "I've failed to DM your hours! Please ensure you have your DMs open!");
          }
        } else {
          const { hours } = client.mmSignUp.get(args[0]);
          const member = await message.guild.members.fetch(args[0]);

          if (!member || (!hours && hours !== 0)) {
            return client.error(message.channel, 'No Middleman Found!', "That middleman wasn't found in the database!");
          }

          const mm = client.mmSignUp.map((v, k) => ({ id: k, hours: v.hours }))
            .sort((a, b) => b.hours - a.hours);
          msg += `\n#${(mm.findIndex((s) => s.id === args[0])) + 1} - **${member.displayName}** (${args[0]}) - \`${hours} hours\``;
          return message.channel.send(`**Middleman Sign Up Statistics**\nRank - Name - Hours\nChannel/Category - Hours${msg}`, { split: true });
        }
      }
    }
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['mmss'],
  permLevel: 'Copper & Booker',
};

module.exports.help = {
  name: 'mmsheetstats',
  category: 'info',
  description: 'Provides sign up stats of middlemen.',
  usage: 'mmsheetstats',
};
