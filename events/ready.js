module.exports = (client) => {
  // Setting activity
  client.user.setActivity(`ACNH with ${client.users.size} users!`);

  // Logging a ready message on first boot
  console.log(`Ready to follow orders sir, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
};
