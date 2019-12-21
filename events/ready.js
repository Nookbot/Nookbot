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

    client.twitter.stream('statuses/filter', { follow: client.config.followedTwitterUsers.join(',') }, (stream) => {
      // eslint-disable-next-line consistent-return
      stream.on('data', (tweet) => {
        switch (tweet.user.id) {
          case 853812637:
            // Tristan
            return client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'TristanTwitterTest', avatarURL: `${tweet.user.profile_image_url_https}` });
          case 848450138:
            // @Doubutsuno_Mori
            return client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'Japan Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
          case 1337012706:
            // @AC_Isabelle
            return client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'United Kingdom Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
          case 1337021028:
            // @AC_Melinda
            return client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'Germany Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
          case 1337023806:
            // @AC_Marie_FR
            return client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'France Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
          case 1337029176:
            // @AC_Fuffi
            return client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'Italy Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
          case 1337043620:
            // @AC_Canela
            return client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'Spain Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
          case 1337057191:
            // @AC_Isabelle_NL
            return client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'Netherlands Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
          case 1377451009:
            // @AnimalCrossing
            return client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttps://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'United States Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
          default:
            // The tweet wasn't actually from the followed users, so toss it
        }
      });
    });

    // Logging a ready message on first boot
    console.log(`Ready to follow orders sir, with ${guild.memberCount} users, in ${guild.channels.size} channels of ${client.guilds.size} guilds.`);
    client.firstReady = true;
  } else {
    console.log('########## We had a second ready event trigger for some reason. ##########');
  }
};
