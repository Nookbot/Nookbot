module.exports = (client) => {
  client.success = (interaction, suc, msg, followUp = false, ephemeral = false) => {
    const options = { content: `${client.emoji.checkMark} **${suc}**\n${msg}`, ephemeral };
    if (interaction.replied) {
      if (followUp) {
        interaction.followUp(options);
      } else {
        interaction.editReply(options);
      }
    } else {
      interaction.reply(options);
    }
  };
};
