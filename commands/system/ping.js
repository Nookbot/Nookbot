// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  // Pings client... noting else I can say here
  const m = await message.channel.send('Pinging the Client...');
  m.edit(`Pong! Latency: **${m.createdTimestamp - message.createdTimestamp}ms** \nAPI Latency: **${Math.round(client.ws.ping)}ms**`);
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['p'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'ping',
  category: 'system',
  description: 'Pings the client',
  usage: 'ping',
};
