const moment = require('moment');

module.exports = (client) => {
  client.startTwitterFeed = () => {
    client.twitter.stream('statuses/filter', { follow: client.config.followedTwitterUsers.join(',') })
      .on('start', () => {
        console.log('Started Twitter Feed Stream');
      })
      .on('data', (tweet) => {
        if (!tweet.user) {
          return;
        }
        switch (tweet.user.id) {
          case 853812637:
            // Tristan
            client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttp://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'TristanTwitterTest', avatarURL: `${tweet.user.profile_image_url_https}` });
            break;
          case 848450138:
            // @Doubutsuno_Mori
            client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttp://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'Japan Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
            break;
          case 1337012706:
            // @AC_Isabelle
            client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttp://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'United Kingdom Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
            break;
          case 1337021028:
            // @AC_Melinda
            client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttp://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'Germany Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
            break;
          case 1337023806:
            // @AC_Marie_FR
            client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttp://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'France Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
            break;
          case 1337029176:
            // @AC_Fuffi
            client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttp://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'Italy Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
            break;
          case 1337043620:
            // @AC_Canela
            client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttp://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'Spain Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
            break;
          case 1337057191:
            // @AC_Isabelle_NL
            client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttp://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'Netherlands Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
            break;
          case 1377451009:
            // @AnimalCrossing
            client.twitterHook.send(`@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttp://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, { username: 'United States Animal Crossing', avatarURL: `${tweet.user.profile_image_url_https}` });
            break;
          default:
            // The tweet wasn't actually from the followed users, so toss it
        }
      })
      .on('error', (error) => console.error(error))
      .on('end', () => {
        console.log('Ended Twitter Feed Stream');
        // Wait 10 seconds, then restart the twitter feed
        setTimeout(() => {
          client.startTwitterFeed();
        }, 10000);
      });
  };
};
