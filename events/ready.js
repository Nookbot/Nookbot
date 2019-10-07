module.exports = (client) => {
  // Setting activity
  const guild = client.guilds.first();
  setInterval(() => client.user.setActivity(`ACNH with ${guild.memberCount} users!`), 30000);

  // Logging a ready message on first boot
  console.log(`Ready to follow orders sir, with ${guild.memberCount} users, in ${guild.channels.size} channels of ${client.guilds.size} guilds.`);
};
