module.exports.run = (client, message, args, level, Discord) => {
  let min = parseInt(args[0], 10);
  let max = parseInt(args[1], 10);
  
  if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0) {
    // We didn't get two numbers, print error
    client.error(message.channel, 'Not Numbers!', 'You must supply two numbers for the minimum and maximum ranked emojis to display.');
    return;
  }

  if (min > max) {
    const temp = min;
    min = max;
    max = temp;
  }

  const emojiArray = client.emojiDB.map((v, k) => {
    return {id: k, uses: v};
  }).sort((a, b) => b.uses - a.uses).slice(max - 1, min);

  let msg = '**Emoji Statistics**\nRank - Name - Uses';

  emojiArray.forEach((e, i) => {
    msg += `\n#${max + i} - ${message.guild.emojis.get(e.id).name} - ${e.uses}`;
  });

  message.channel.send(msg, { split: true });
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['es', 'emoji'],
  permLevel: 'Mod',
  args: 2
};

module.exports.help = {
  name: 'emojistats',
  category: 'info',
  description: 'Displays usage statistics for emojis in the guild',
  usage: 'emojistats <min> <max>',
  details: '<min> => The minimum ranked emoji to display.\n<max> => The maximum ranked emoji to display.',
};