module.exports = (client) => {
  client.success = (channel, suc, msg) => {
    channel.send(`${client.emoji.checkMark} **${suc}**\n${msg}`, { split: true });
  };
};
