module.exports = async (client, interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  if (!interaction.member) {
    await interaction.guild.members.fetch(interaction.user.id);
  }

  await client.commands.get(interaction.commandName).run(client, interaction);
};
