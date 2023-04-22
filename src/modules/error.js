module.exports = (client) => {
  client.error = (channel, err, msg) => {
    client.sendLongMessage(channel, `${client.emoji.redX} **${err}**\n${msg}`);
  };
};
