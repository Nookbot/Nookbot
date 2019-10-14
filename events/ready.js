const moment = require('moment');

module.exports = (client) => {
  // Setting activity
  const guild = client.guilds.first();
  setInterval(() => client.user.setActivity(`ACNH with ${guild.memberCount} users!`), 30000);

  const now = moment();
  const releaseDate = moment([2020, 2, 20]);

  if (now < releaseDate) {
    const postTime = moment().set({ h: '20', m: '00', ms: '00' });
    let timeUntilFirstPost;

    if (now > postTime) {
      timeUntilFirstPost = now - postTime;
    } else {
      timeUntilFirstPost = postTime - now;
    }

    const post = () => {
      const daysUntilRelease = releaseDate.diff(moment(), 'days');

      const channel = guild.channels.get('494376688877174785');
      return channel.send(`**Animal Crossing: New Horizons** releases in **$${daysUntilRelease} days!**`);
    };

    setTimeout(() => {
      post();

      setInterval(() => {
        post();
      }, 3600000 * 24);
    }, timeUntilFirstPost);
  }

  // Logging a ready message on first boot
  console.log(`Ready to follow orders sir, with ${guild.memberCount} users, in ${guild.channels.size} channels of ${client.guilds.size} guilds.`);
};
