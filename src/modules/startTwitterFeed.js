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

        let username;
        switch (tweet.user.id) {
          case 853812637:
            // Tristan
            username = 'TristanTwitterTest';
            break;
          case 848450138:
            // @Doubutsuno_Mori
            username = 'Japan Animal Crossing';
            break;
          case 1337012706:
            // @AC_Isabelle
            username = 'United Kingdom Animal Crossing';
            break;
          case 1337021028:
            // @AC_Melinda
            username = 'Germany Animal Crossing';
            break;
          case 1337023806:
            // @AC_Marie_FR
            username = 'France Animal Crossing';
            break;
          case 1337029176:
            // @AC_Fuffi
            username = 'Italy Animal Crossing';
            break;
          case 1337043620:
            // @AC_Canela
            username = 'Spain Animal Crossing';
            break;
          case 1337057191:
            // @AC_Isabelle_NL
            username = 'Netherlands Animal Crossing';
            break;
          case 1377451009:
            // @AnimalCrossing
            username = 'United States Animal Crossing';
            break;
          default:
            // The tweet wasn't actually from the followed users, so toss it
        }

        if (username) {
          client.twitterHook.send({ content: `@${tweet.user.screen_name.toLowerCase()} tweeted this on ${moment.utc(tweet.created_at, 'ddd MMM DD HH:mm:ss ZZ YYYY').format('MMMM D, YYYY [at] h:mmA [UTC:]')}\nhttp://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`, username, avatarURL: `${tweet.user.profile_image_url_https}` });
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
