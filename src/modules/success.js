module.exports = (client) => {
  client.success = (channel, suc, msg) => {
    client.sendLongMessage(channel, `${client.emoji.checkMark} **${suc}**\n${msg}`);
  };
};
