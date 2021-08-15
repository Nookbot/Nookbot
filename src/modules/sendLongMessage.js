const { Util } = require('discord.js');

module.exports = (client) => {
  client.sendLongMessage = (interaction, message, ephemeral = false) => {
    const splitMsg = Util.splitMessage(message);
    client.asyncForEach(splitMsg, async (msgToSend, index) => {
      if (index === 0) {
        await interaction.reply({ content: msgToSend, ephemeral });
      } else {
        await interaction.followUp({ content: msgToSend, ephemeral });
      }
    });
  };
};
