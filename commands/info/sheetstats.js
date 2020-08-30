// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line consistent-return
module.exports.run = async (client, message, args, level) => {
  let num0 = parseInt(args[0], 10);
  let num1 = parseInt(args[1], 10);
  let msg = '';
  const sheetDBSize = client.reactionSignUp.count - 1;

  if (level < 5) {
    const mod = client.reactionSignUp.get(message.member.id);

    // Try to send DM
    try {
      const dmChannel = await message.member.createDM();

      if (!mod) {
        return client.error(dmChannel, 'No Mod Found!', 'You were not found in the database!');
      }

      await dmChannel.send(`**Sign Up Sheet Statistics**\nName - Hours\n**${message.member.displayName}** (${message.member.id}) - ${mod.hoursThisWeek} hours`);
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

        const mods = client.reactionSignUp.map((v, k) => ({ id: k, hours: v.hoursThisWeek }))
          .sort((a, b) => b.hours - a.hours)
          .slice(0, num1);

        await client.asyncForEach(mods, async (e, i) => {
          if (e.id !== 'data') {
            const mod = await message.guild.members.fetch(e.id) || 'Unknown Mod';
            msg += `\n#${i + 1} - **${mod.displayName}** (${e.id}) - ${e.hours} hours`;
          }
        });

        if (!msg) {
          return client.error(message.channel, 'No Matches!', 'No mods matched your search critera!');
        }
        return message.channel.send(`**Sign Up Sheet Statistics**\nRank - Name - Hours${msg}`, { split: true });
      }
      case 'b':
      case 'bottom': {
        if (Number.isNaN(num1) || num1 <= 0) {
          return client.error(message.channel, 'Not a Number!', 'You must supply a number for the amount of bottom ranked mods to display.');
        }

        const mods = client.reactionSignUp.map((v, k) => ({ id: k, hours: v.hoursThisWeek }))
          .sort((a, b) => b.hours - a.hours)
          .slice(-num1);

        await client.asyncForEach(mods, async (e, i) => {
          if (e.id !== 'data') {
            const mod = await message.guild.members.fetch(e.id);
            msg += `\n#${sheetDBSize - num1 + i + 1} - **${mod.displayName}** (${e.id}) - ${e.hours} hours`;
          }
        });

        if (!msg) {
          return client.error(message.channel, 'No Matches!', 'No mods matched your search critera!');
        }
        return message.channel.send(`**Sign Up Sheet Statistics**\nRank - Name - Hours${msg}`, { split: true });
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

          const mods = client.reactionSignUp.map((v, k) => ({ id: k, hours: v.hoursThisWeek }))
            .sort((a, b) => b.hours - a.hours)
            .slice(num1 - 1, num0);

          await client.asyncForEach(mods, async (e, i) => {
            if (e.id !== 'data') {
              const mod = await message.guild.members.fetch(e.id) || 'Unknown Mod';
              msg += `\n#${num1 + i} - **${mod.displayName}** (${e.id}) - ${e.hours} hours`;
            }
          });

          if (!msg) {
            return client.error(message.channel, 'No Matches!', 'No mods matched your search critera!');
          }
          return message.channel.send(`**Sign Up Sheet Statistics**\nRank - Name - Hours${msg}`, { split: true });
        }

        if (args.length === 0) {
          const mod = client.reactionSignUp.get(message.member.id);
          // Try to send DM
          try {
            const dmChannel = await message.member.createDM();

            if (!mod) {
              return client.error(dmChannel, 'No Mod Found!', 'You were not found in the database!');
            }

            await dmChannel.send(`**Sign Up Sheet Statistics**\nName - Hours\n**${message.member.displayName}** (${message.member.id}) - ${mod.hoursThisWeek} hours`);
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

          const mods = client.reactionSignUp.map((v, k) => ({ id: k, hours: v.hoursThisWeek }))
            .sort((a, b) => b.hours - a.hours);

          msg += `\n#${(mods.findIndex((s) => s.id === args[0]))} - **${member.displayName}** (${args[0]}) - ${mod.hoursThisWeek} hours`;
          return message.channel.send(`**Sign Up Sheet Statistics**\nRank - Name - Hours${msg}`, { split: true });
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
