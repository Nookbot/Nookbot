const { Util } = require('discord.js');

module.exports = (client) => {
  client.sendLongMessage = async (channel, msg) => {
    const splitMsg = Util.splitMessage(msg);
    await client.asyncForEach(splitMsg, async (msgToSend) => {
      await channel.send({ content: msgToSend });
    });
  };
};
