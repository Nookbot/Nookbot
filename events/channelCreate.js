module.exports = (client, channel) => {
  if (channel.type !== 'GUILD_TEXT' || channel.guildId !== client.config.modMailGuild) {
    return;
  }

  setTimeout(async () => {
    if (channel.topic !== null) {
      const user = await client.users.fetch(channel.topic.trim());
      const { infractions } = client.userDB.ensure(user.id, client.config.userDBDefaults);
      let msg = `__**${user.tag}'s Bee Stings**__`;
      let expPoints = 0;
      let expMsg = '';
      let curPoints = 0;
      let curMsg = '';
      const time = Date.now();
      infractions.forEach((i) => {
        const moderator = client.users.cache.get(i.moderator);
        const timestamp = Math.floor(new Date(i.date).getTime() / 1000);
        if ((i.points * 604800000) + i.date > time) {
          curPoints += i.points;
          curMsg += `\n• Case ${i.case} - ${moderator ? `Mod: ${moderator.tag}` : `Unknown Mod ID: ${i.moderator || 'No ID Stored'}`} - (<t:${timestamp}:F>; <t:${timestamp}:R>) ${i.points} bee sting${i.points === 1 ? '' : 's'}\n> Reason: ${i.reason}`;
        } else {
          expPoints += i.points;
          expMsg += `\n• Case ${i.case} - ${moderator ? `Mod: ${moderator.tag}` : `Unknown Mod ID: ${i.moderator || 'No ID Stored'}`} - (<t:${timestamp}:F>; <t:${timestamp}:R>) ${i.points} bee sting${i.points === 1 ? '' : 's'}\n> Reason: ${i.reason}`;
        }
      });

      if (curMsg) {
        msg += `\n**Current bee stings (${curPoints} total):**${curMsg}`;
      }
      if (expMsg) {
        msg += `\n**Expired bee stings (${expPoints} total):**${expMsg}`;
      }

      if (curMsg || expMsg) {
        client.sendLongMessage(channel, msg);
      } else {
        // No infractions
        channel.send(`${user.tag} doesn't have any bee stings!`);
      }
    }
  }, 2000);
};
