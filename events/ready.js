const moment = require('moment');

module.exports = (client) => {
  // Setting activity
  const guild = client.guilds.first();
  setInterval(() => client.user.setActivity(`ACNH with ${guild.memberCount} users!`), 30000);

  const now = moment();
  const postTime = moment().set({
    h: '00', m: '00', s: '00', ms: '00',
  });
  let timeUntilFirstPost;

  if (now > postTime) {
    timeUntilFirstPost = now - postTime;
  } else {
    timeUntilFirstPost = postTime - now;
  }

  const channel = guild.channels.get('494376688877174785');

  setTimeout(() => {
    client.countdown(channel);

    setInterval(() => {
      client.countdown(channel);
    }, 3600000 * 24);
  }, timeUntilFirstPost);

  // Logging a ready message on first boot
  console.log(`Ready to follow orders sir, with ${guild.memberCount} users, in ${guild.channels.size} channels of ${client.guilds.size} guilds.`);
};
