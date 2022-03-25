const { Util } = require('discord.js');

module.exports = (client) => {
  client.sendLongInteraction = async (interaction, message, ephemeral = false) => {
    const splitMsg = Util.splitMessage(message);
    await client.asyncForEach(splitMsg, async (msgToSend, index) => {
      if (index === 0) {
        await interaction.reply({ content: msgToSend, ephemeral });
      } else {
        await interaction.followUp({ content: msgToSend, ephemeral });
      }
    });
  };
};
