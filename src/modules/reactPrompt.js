const Discord = require('discord.js');

module.exports = (client) => {
  client.reactPrompt = async (message, question) => {
    const checkButton = new Discord.MessageButton()
      .setCustomId('check')
      .setStyle('SUCCESS')
      .setEmoji(client.emoji.checkMark);
    const xButton = new Discord.MessageButton()
      .setCustomId('x')
      .setStyle('DANGER')
      .setEmoji(client.emoji.redX);
    const confirm = await message.channel.send({ content: question, components: [new Discord.MessageActionRow().addComponents(checkButton, xButton)] });

    const filter = (interaction) => ['check', 'x'].includes(interaction.customId)
            && interaction.user.id === message.author.id;

    let decision = false;
    await confirm.awaitMessageComponent({ filter, time: 30000, componentType: 'BUTTON' })
      .then((interaction) => {
        checkButton.setDisabled();
        xButton.setDisabled();
        interaction.update({ components: [new Discord.MessageActionRow().addComponents(checkButton, xButton)] });
        if (interaction.customId === 'check') {
          decision = true;
        }
      })
      .catch(() => {
        // Nothing
      });
    await confirm.delete();
    return decision;
  };
};
