module.exports.run = (client, message, args) => {
  let num0 = parseInt(args[0], 10);
  let num1 = parseInt(args[1], 10);
  let msg = '';
  const emojiDBSize = client.emojiDB.count;
  const emojiRegex = /<a?:\w+:([\d]+)>/g;
  let emojiMatch;
  const emojiList = [];
  switch (args[0]) {
    case 't':
    case 'top':
      if (Number.isNaN(num1) || num1 <= 0) {
        return client.error(message.channel, 'Not a Number!', 'You must supply a number for the amount of top ranked emojis to display.');
      }

      client.emojiDB.map((v, k) => ({ id: k, uses: v }))
        .sort((a, b) => b.uses - a.uses)
        .slice(0, num1)
        .forEach((e, i) => {
          msg += `\n#${i + 1} - ${message.guild.emojis.cache.get(e.id).name} - ${e.uses}`;
        });

      if (!msg) {
        return client.error(message.channel, 'No Matches!', 'No emojis matched your search critera!');
      }
      return message.channel.send(`**Emoji Statistics**\nRank - Name - Uses${msg}`, { split: true });
    case 'b':
    case 'bottom':
      if (Number.isNaN(num1) || num1 <= 0) {
        return client.error(message.channel, 'Not a Number!', 'You must supply a number for the amount of bottom ranked emojis to display.');
      }

      client.emojiDB.map((v, k) => ({ id: k, uses: v }))
        .sort((a, b) => b.uses - a.uses)
        .slice(-num1)
        .forEach((e, i) => {
          msg += `\n#${emojiDBSize - num1 + i + 1} - ${message.guild.emojis.cache.get(e.id).name} - ${e.uses}`;
        });

      if (!msg) {
        return client.error(message.channel, 'No Matches!', 'No emojis matched your search critera!');
      }
      return message.channel.send(`**Emoji Statistics**\nRank - Name - Uses${msg}`, { split: true });
    case 'm':
    case 'more':
      if (Number.isNaN(num1) || num1 < 0) {
        return client.error(message.channel, 'Not a Number!', 'You must supply a number for the minimum amount of uses an emoji must have to be displayed.');
      }

      client.emojiDB.map((v, k) => ({ id: k, uses: v }))
        .sort((a, b) => b.uses - a.uses)
        .filter((e) => e.uses >= num1)
        .forEach((e, i) => {
          msg += `\n#${i + 1} - ${message.guild.emojis.cache.get(e.id).name} - ${e.uses}`;
        });

      if (!msg) {
        return client.error(message.channel, 'No Matches!', 'No emojis matched your search critera!');
      }
      return message.channel.send(`**Emoji Statistics**\nRank - Name - Uses${msg}`, { split: true });
    case 'l':
    case 'less':
      if (Number.isNaN(num1) || num1 < 0) {
        return client.error(message.channel, 'Not a Number!', 'You must supply a number for the maximum amount of uses an emoji must have to be displayed.');
      }

      client.emojiDB.map((v, k) => ({ id: k, uses: v }))
        .sort((a, b) => b.uses - a.uses)
        .filter((e) => e.uses <= num1)
        .forEach((e, i, a) => {
          msg += `\n#${emojiDBSize - a.length + i + 1} - ${message.guild.emojis.cache.get(e.id).name} - ${e.uses}`;
        });

      if (!msg) {
        return client.error(message.channel, 'No Matches!', 'No emojis matched your search critera!');
      }
      return message.channel.send(`**Emoji Statistics**\nRank - Name - Uses${msg}`, { split: true });
    default:
      if (args.length === 2 && Number.isInteger(num0) && Number.isInteger(num1)) {
        if (num0 <= 0 || num1 <= 0) {
          return client.error(message.channel, 'Invalid Numbers!', 'The numbers provided must be greater than 0.');
        }

        if (num1 > num0) {
          const temp = num0;
          num0 = num1;
          num1 = temp;
        }

        client.emojiDB.map((v, k) => ({ id: k, uses: v }))
          .sort((a, b) => b.uses - a.uses)
          .slice(num1 - 1, num0)
          .forEach((e, i) => {
            msg += `\n#${num1 + i} - ${message.guild.emojis.cache.get(e.id).name} - ${e.uses}`;
          });

        if (!msg) {
          return client.error(message.channel, 'No Matches!', 'No emojis matched your search critera!');
        }
        return message.channel.send(`**Emoji Statistics**\nRank - Name - Uses${msg}`, { split: true });
      }

      while ((emojiMatch = emojiRegex.exec(args.join(' ')))) {
        if (client.emojiDB.has(emojiMatch[1])) {
          // Decrement it so it doesn't show a new usage since we want to check what its real usage is
          client.emojiDB.dec(emojiMatch[1]);
          emojiList.push({ id: emojiMatch[1], uses: client.emojiDB.get(emojiMatch[1]) });
        }
      }

      if (emojiList.length !== 0) {
        const emojiIDs = emojiList.map((v) => v.id);
        client.emojiDB.map((v, k) => ({ id: k, uses: v }))
          .sort((a, b) => b.uses - a.uses)
          .forEach((e, i) => {
            if (emojiIDs.includes(e.id)) {
              msg += `\n#${i + 1} - ${message.guild.emojis.cache.get(e.id).name} - ${e.uses}`;
            }
          });

        if (!msg) {
          return client.error(message.channel, 'No Matches!', 'No emojis matched your search critera!');
        }
        return message.channel.send(`**Emoji Statistics**\nRank - Name - Uses${msg}`, { split: true });
      }
      return client.error(message.channel, 'Invalid Usage!', 'You used this command incorrectly! Use \`.help emojistats\` for details on how to use this command.');
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['es', 'emoji'],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'emojistats',
  category: 'info',
  description: 'Displays usage statistics for emojis in the guild',
  usage: 'emojistats <top|bottom|more|less> <num>|<min> <max>|<emojis>',
  details: '<top|bottom|more|less> <num> => Whether to display the top/bottom <num> ranked emojis, or the emojis with more/less than <num> uses.\n<min> <max> => The minimum and maximum ranked emojis to display.\n<emojis> => Actual emojis to display their rank and usage.',
};
