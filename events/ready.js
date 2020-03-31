const schedule = require('node-schedule');
const moment = require('moment');
const db = require('../src/calendar/database.json');

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

    // Clear any session channels from the server if they have no members
    client.sessionDB.keyArray().forEach((sesID) => {
      const sessionChannel = client.channels.cache.get(sesID);
      if (sessionChannel && sessionChannel.members.size === 0
          && !sessionChannel.deleted && sessionChannel.deletable) {
        // Session is empty, delete the channel and database entry
        sessionChannel.delete('[Auto] Purged empty session channels on ready event.').then((delChannel) => {
          // Delete sessionDB entry
          client.sessionDB.delete(delChannel.id);
        }).catch((error) => {
          console.error(error);
        });
      }
    });

    try {
      client.startTwitterFeed();
    } catch (err) {
      // The stream function returned an error
      console.error(err);
    }

    // Implementated from code provided by plump#6345
    schedule.scheduleJob('0 15 * * *', () => {
      const date = moment().add(1, 'd');

      const replaceLast = (x, y, z) => {
        const a = x.split('');
        const { length } = y;
        if (x.lastIndexOf(y) !== -1) {
          for (let i = x.lastIndexOf(y); i < x.lastIndexOf(y) + length; i++) {
            if (i === x.lastIndexOf(y)) {
              a[i] = z;
            } else {
              delete a[i];
            }
          }
        }
        return a.join('');
      };

      const todayDate = `${date.month() + 1}/${date.date()}`;
      let todayList;
      let numOfVils = 0;
      let image;

      // eslint-disable-next-line no-restricted-syntax
      for (const name in db) {
        if (db[name].birthday === todayDate) {
          numOfVils += 1;
          image = `./villagers/${db[name].photoLink}`;
          todayList = `${todayList}**${name}**, `;
          if (numOfVils > 1) {
            image = `./villagers/shared/${todayList.replace(/\*|,| /g, '')}.png`;
          }
        }
      }

      if (todayList === undefined) {
        return; // no birthdays today end code.
      }

      guild.channels.cache.get('690235951628288023').send(`**__•• ${date.format('MMMM')} ${date.date()}, ${date.year()} ••__**\n• ${replaceLast(`${todayList.slice(0, -2)}\'s birthday${numOfVils > 1 ? 's' : ''}!`, ',', ' and')}`, { files: [image] });
    });

    // Logging a ready message on first boot
    console.log(`Ready to follow orders sir, with ${guild.memberCount} users, in ${guild.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    client.firstReady = true;
  } else {
    console.log('########## We had a second ready event trigger for some reason. ##########');
  }
};
