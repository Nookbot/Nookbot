module.exports = (client) => {
  client.error = (channel, err, msg) => {
    channel.send(`${client.emoji.redX} **${err}**\n${msg}`, { split: true });
  };
};
