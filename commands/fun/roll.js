// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  const inputNumber = parseInt(args[0], 10);

  if (!inputNumber) {
    return client.error(message.channel, 'Invalid Number!', 'Please provide a valid number for the max range!');
  }

  const outputNumber = Math.ceil(Math.random() * inputNumber);

  return message.channel.send(`${client.emoji.gameDie} **${outputNumber}** (1-${inputNumber})`);
};

module.exports.conf = {
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
  args: 1,
};

module.exports.help = {
  name: 'roll',
  category: 'fun',
  description: 'Rolls a random number between 1 and the number given',
  usage: 'roll <number>',
  details: '<number> => Any number you wish to be the max range',
};
