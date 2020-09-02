const moment = require('moment');

/* eslint-disable consistent-return */
module.exports = async (client, messageReaction, user) => {
  if (user.bot || messageReaction.message.guild.id !== client.config.mainGuild) {
    return;
  }

  const reactionData = client.reactionSignUp.get('data');

  if (reactionData.messageID === messageReaction.message.id) {
    if (reactionData.reactions.includes(messageReaction.emoji.name)) {
      const index = reactionData.reactions.findIndex((s) => s === messageReaction.emoji.name);
      const namesToEdit = reactionData.names[index].split(',');
      const member = await messageReaction.message.guild.members.fetch(user.id);
      const nameToRemove = namesToEdit.findIndex((s) => s.trim() === member.displayName);
      namesToEdit.splice(nameToRemove, 1);

      let newSignUp = '';
      for (let i = 0; i < reactionData.signUpSheet.length; i++) {
        if (i === index) {
          newSignUp += `${reactionData.signUpSheet[i]}${namesToEdit.join(', ').trim()}\n`;
        } else {
          newSignUp += `${reactionData.signUpSheet[i]}${reactionData.names[i]}\n`;
        }
      }

      const { names } = reactionData;
      names.splice(index, 1, namesToEdit.join(', '));
      client.reactionSignUp.set('data', names, 'names');

      client.reactionSignUp.remove(user.id, messageReaction.emoji.name, 'channels');

      if (client.reactionSignUp.get(user.id).channels.length === 0) {
        const start = client.reactionSignUp.get(user.id, 'start');
        const duration = moment.duration(moment().diff(moment(start)));
        const hoursToAdd = (Math.round(duration.asHours() * 1000) / 1000).toFixed(3);

        // eslint-disable-next-line no-restricted-globals
        if (isNaN(duration) || !parseFloat(hoursToAdd)) {
          client.channels.get('629468250601816097').send(`<@392398406552780800> please check logs for NaN values that just came through!\n**D**: ${duration}\n**H**: ${hoursToAdd}\n**CH**: ${client.reactionSignUp.get(user.id).hoursThisWeek}`);
        }
        client.reactionSignUp.math(user.id, '+', parseFloat(hoursToAdd), 'hoursThisWeek');
        client.reactionSignUp.set(user.id, null, 'start');
      }

      const msg = client.channels.cache.get(reactionData.channelID).messages.cache.get(reactionData.messageID);
      return msg.edit(newSignUp);
    }
  }

  const reactionRoleMenu = client.reactionRoleDB.get(messageReaction.message.id);

  // If not there isn't a type, then this is not a reaction role message.
  if (!reactionRoleMenu) {
    return;
  }

  const roleID = reactionRoleMenu.reactions[messageReaction.emoji.id || messageReaction.emoji.identifier];

  if (roleID) {
    const member = await client.guilds.cache.get(client.config.mainGuild).members.fetch(user.id);
    if (member && member.roles.cache.has(roleID)) {
      member.roles.remove(roleID, '[Auto] Reaction Role Remove');
    }
  }
};
