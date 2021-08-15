module.exports = (client) => {
  client.error = (interaction, err, msg, followUp = false, ephemeral = false) => {
    const options = { content: `${client.emoji.checkMark} **${err}**\n${msg}`, ephemeral };
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
