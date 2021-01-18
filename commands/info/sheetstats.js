// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line consistent-return

module.exports.run = async (client, message, args, level) => {
  let num0 = parseInt(args[0], 10);
  let num1 = parseInt(args[1], 10);
  let msg = '';
  const sheetDBSize = client.reactionSignUp.count - 1;

  if (level < 6) {
    const mod = client.reactionSignUp.get(message.member.id);

    // Try to send DM
    try {
      const dmChannel = await message.member.createDM();

      if (!mod) {
        return client.error(dmChannel, 'No Mod Found!', 'You were not found in the database!');
      }

      const { totalHours, channelHours } = client.addHours(mod);

      await dmChannel.send(`**Sign Up Sheet Statistics**\nName - Hours\nChannel/Category - Hours\n**${message.member.displayName}** (${message.member.id}) - \`${totalHours} hours\`\n\n${channelHours.join('\n')}`);
      return client.success(message.channel, 'Hours Sent!', "I've successfully sent you your current hours for the week!");
    } catch (e) {
      return client.error(message.channel, 'Failed to DM Hours!', "I've failed to DM your hours! Please esnure you have your DMs open!");
    }
  } else {
    switch (args[0]) {
      case 't':
      case 'top': {
        if (Number.isNaN(num1) || num1 <= 0) {
          return client.error(message.channel, 'Not a Number!', 'You must supply a number for the amount of top ranked mods to display.');
        }

        const mods = client.reactionSignUp.map((v, k) => ({ id: k, hours: v.hours ? v.hours.total : undefined }))
          .sort((a, b) => b.hours - a.hours)
          .slice(0, num1);

        await client.asyncForEach(mods, async (e, i) => {
          if (e.id !== 'data') {
            const modMember = await message.guild.members.fetch(e.id) || 'Unknown Mod';
            msg += `\n#${i + 1} - **${modMember.displayName}** (${e.id}) - \`${e.hours} hours\``;

            const mod = client.reactionSignUp.get(e.id);
            const { channelHours } = client.addHours(mod);
            msg += channelHours.length === 0 ? '\n' : `\n${channelHours.join('\n')}\n`;
          }
        });

        if (!msg) {
          return client.error(message.channel, 'No Matches!', 'No mods matched your search critera!');
        }
        return message.channel.send(`**Sign Up Sheet Statistics**\nRank - Name - Hours\nChannel/Category - Hours${msg}`, { split: true });
      }
      case 'b':
      case 'bottom': {
        if (Number.isNaN(num1) || num1 <= 0) {
          return client.error(message.channel, 'Not a Number!', 'You must supply a number for the amount of bottom ranked mods to display.');
        }

        const mods = client.reactionSignUp.map((v, k) => ({ id: k, hours: v.hours ? v.hours.total : undefined }))
          .sort((a, b) => b.hours - a.hours)
          .slice(-num1);

        await client.asyncForEach(mods, async (e, i) => {
          if (e.id !== 'data') {
            const modMember = await message.guild.members.fetch(e.id);
            msg += `\n#${sheetDBSize - num1 + i + 1} - **${modMember.displayName}** (${e.id}) - \`${e.hours} hours\``;

            const mod = client.reactionSignUp.get(e.id);
            const { channelHours } = client.addHours(mod);
            msg += channelHours.length === 0 ? '\n' : `\n${channelHours.join('\n')}\n`;
          }
        });

        if (!msg) {
          return client.error(message.channel, 'No Matches!', 'No mods matched your search critera!');
        }
        return message.channel.send(`**Sign Up Sheet Statistics**\nRank - Name - Hours\nChannel/Category - Hours${msg}`, { split: true });
      }
      case 'remove':
      case 'delete':
      case 'r':
      case 'd':
        // eslint-disable-next-line no-restricted-globals
        if (!client.reactionSignUp.has(args[1]) || isNaN(args[1])) {
          return client.error(message.channel, 'Mod Not Found!', 'The moderator was not found in the database and therefore cannot be removed!');
        }

        client.reactionSignUp.delete(args[1]);
        return client.success(message.channel, 'Successfully Removed from the Database!', `I've successfully removed <@${args[1]}> \`(${args[1]})\` from the reaction signup database!`);
      case 'set':
      case 's': {
        const hoursToSet = parseFloat(args[2]);
        // eslint-disable-next-line no-restricted-globals
        if (!client.reactionSignUp.has(args[1]) || isNaN(args[1])) {
          return client.error(message.channel, 'Mod Not Found!', 'The moderator was not found in the database and therefore cannot be removed!');
        }

        if (!hoursToSet) {
          return client.error(message.channel, 'Invalid Hours!', 'Please provide a valid number of hours!');
        }

        client.reactionSignUp.set(args[1], hoursToSet, 'hours.total');
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

          const mods = client.reactionSignUp.map((v, k) => ({ id: k, hours: v.hours ? v.hours.total : undefined }))
            .sort((a, b) => b.hours - a.hours)
            .slice(num1 - 1, num0);

          await client.asyncForEach(mods, async (e, i) => {
            if (e.id !== 'data') {
              const modMember = await message.guild.members.fetch(e.id) || 'Unknown Mod';
              msg += `\n#${num1 + i} - **${modMember.displayName}** (${e.id}) - \`${e.hours} hours\``;

              const mod = client.reactionSignUp.get(e.id);
              const { channelHours } = client.addHours(mod);
              msg += channelHours.length === 0 ? '\n' : `\n${channelHours.join('\n')}\n`;
            }
          });

          if (!msg) {
            return client.error(message.channel, 'No Matches!', 'No mods matched your search critera!');
          }
          return message.channel.send(`**Sign Up Sheet Statistics**\nRank - Name - Hours\nChannel/Category - Hours${msg}`, { split: true });
        }

        if (args.length === 0) {
          const mod = client.reactionSignUp.get(message.member.id);
          // Try to send DM
          try {
            const dmChannel = await message.member.createDM();

            if (!mod) {
              return client.error(dmChannel, 'No Mod Found!', 'You were not found in the database!');
            }

            const { totalHours, channelHours } = client.addHours(mod);

            await dmChannel.send(`**Sign Up Sheet Statistics**\nName - Hours\nChannel/Category - Hours\n**${message.member.displayName}** (${message.member.id}) - \`${totalHours} hours\`\n\n${channelHours.join('\n')}`);
            return client.success(message.channel, 'Hours Sent!', "I've successfully sent you your current hours for the week!");
          } catch (e) {
            return client.error(message.channel, 'Failed to DM Hours!', "I've failed to DM your hours! Please esnure you have your DMs open!");
          }
        } else {
          const mod = client.reactionSignUp.get(args[0]);
          const member = await message.guild.members.fetch(args[0]);

          if (!member || !mod) {
            return client.error(message.channel, 'No Mod Found!', "That mod wasn't found in the database!");
          }

          const mods = client.reactionSignUp.map((v, k) => ({ id: k, hours: v.hours ? v.hours.total : undefined }))
            .sort((a, b) => b.hours - a.hours);
          msg += `\n#${(mods.findIndex((s) => s.id === args[0])) + 1} - **${member.displayName}** (${args[0]}) - \`${mod.hours.total} hours\``;

          const { channelHours } = client.addHours(mod);
          return message.channel.send(`**Sign Up Sheet Statistics**\nRank - Name - Hours\nChannel/Category - Hours${msg}\n\n${channelHours.join('\n')}`, { split: true });
        }
      }
    }
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['ss'],
  permLevel: 'Mod',
};

module.exports.help = {
  name: 'sheetstats',
  category: 'info',
  description: 'Provides sign up stats of mods.',
  usage: 'sheetstats',
};
