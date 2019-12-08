const moment = require('moment');

module.exports = (client) => {
  // Setting activity
  if (!client.firstReady) {
    const guild = client.guilds.first();

    // Emoji usage tracking database init
    guild.emojis.forEach((e) => {
      // If EmojiDB does not have the emoji, add it.
      if (!client.emojiDB.has(e.id)) {
        client.emojiDB.set(e.id, 0);
      }
    });
    // Sweep emojis from the DB that are no longer in the guild emojis
    client.emojiDB.sweep((v, k) => !guild.emojis.has(k));

    setInterval(() => client.user.setActivity(`ACNH with ${guild.memberCount} users!`), 30000);

    const timeUntilFirstPost = moment().add(1, 'd').startOf('day').diff(moment());

    const channel = guild.channels.get('494376688877174785');

    setTimeout(() => {
      client.countdown(channel);

      setInterval(() => {
        client.countdown(channel);
      }, 3600000 * 24);
    }, timeUntilFirstPost);

    // Save the current collection of guild invites.
    client.guilds.first().fetchInvites().then((guildInvites) => {
      client.invites = guildInvites;
    });

    // Logging a ready message on first boot
    console.log(`Ready to follow orders sir, with ${guild.memberCount} users, in ${guild.channels.size} channels of ${client.guilds.size} guilds.`);
    client.firstReady = true;
  } else {
    console.log('########## We had a second ready event trigger for some reason. ##########');
  }
};
