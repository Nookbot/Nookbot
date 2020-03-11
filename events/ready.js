module.exports = (client) => {
  // Setting activity
  if (!client.firstReady) {
    const guild = client.guilds.cache.first();

    // Emoji usage tracking database init
    guild.emojis.cache.forEach((e) => {
      // If EmojiDB does not have the emoji, add it.
      if (!client.emojiDB.has(e.id)) {
        client.emojiDB.set(e.id, 0);
      }
    });
    // Sweep emojis from the DB that are no longer in the guild emojis
    client.emojiDB.sweep((v, k) => !guild.emojis.cache.has(k));

    setInterval(() => client.user.setActivity(`ACNH with ${guild.memberCount} users!`), 30000);

    // Save the current collection of guild invites.
    client.guilds.cache.first().fetchInvites().then((guildInvites) => {
      client.invites = guildInvites;
    });

    try {
      client.startTwitterFeed();
    } catch (err) {
      // The stream function returned an error
      console.error(err);
    }

    // Logging a ready message on first boot
    console.log(`Ready to follow orders sir, with ${guild.memberCount} users, in ${guild.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    client.firstReady = true;
  } else {
    console.log('########## We had a second ready event trigger for some reason. ##########');
  }
};
