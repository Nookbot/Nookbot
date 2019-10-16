// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  client.countdown(message.channel);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['cd', 'count', 'release'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'countdown',
  category: 'game',
  description: "Gets the current countdown from AC:NH's release",
  usage: 'countdown',
};
