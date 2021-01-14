const moment = require('moment');

/* eslint-disable consistent-return */
module.exports = async (client, messageReaction, user) => {
  if (user.bot || !messageReaction.message.guild) {
    return;
  }

  const reactionData = client.reactionSignUp.get('data');

  if (reactionData.messageID === messageReaction.message.id) {
    if (reactionData.reactions.includes(messageReaction.emoji.name)) {
      const index = reactionData.reactions.findIndex((s) => s === messageReaction.emoji.name);
      const namesToEdit = reactionData.names[index];
      const idsToEdit = reactionData.ids[index];
      const indexOfRemoval = idsToEdit.findIndex((s) => s === user.id);
      namesToEdit.splice(indexOfRemoval, 1);
      idsToEdit.splice(indexOfRemoval, 1);

      let newSignUp = '';
      for (let i = 0; i < reactionData.signUpSheet.length; i++) {
        if (i === index) {
          newSignUp += `${reactionData.signUpSheet[i]}${namesToEdit.join(', ').trim()}\n`;
        } else {
          newSignUp += `${reactionData.signUpSheet[i]}${reactionData.names[i].join(', ')}\n`;
        }
      }

      client.reactionSignUp.set('data', namesToEdit, `names[${index}]`);
      client.reactionSignUp.set('data', idsToEdit, `ids[${index}]`);

      const mod = client.reactionSignUp.get(user.id);
      const channelToRemove = mod.channels.find((c) => Object.keys(c)[0] === messageReaction.emoji.name);

      if (channelToRemove) {
        const channelDuration = moment.duration(moment().diff(moment(channelToRemove[messageReaction.emoji.name])));
        const channelHoursToAdd = (Math.round(channelDuration.asHours() * 1000) / 1000).toFixed(3);
        if (mod.hours[messageReaction.emoji.name] === undefined) {
          client.reactionSignUp.set(user.id, 0, `hours[${messageReaction.emoji.name}]`);
        }
        client.reactionSignUp.math(user.id, '+', parseFloat(channelHoursToAdd), `hours[${messageReaction.emoji.name}]`);

        const channelsToEdit = mod.channels;
        const indexOfChannel = channelsToEdit.findIndex((c) => c === channelToRemove);
        mod.channels.splice(indexOfChannel, 1);
        client.reactionSignUp.set(user.id, channelsToEdit, 'channels');
      }

      if (client.reactionSignUp.get(user.id).channels.length === 0 && client.reactionSignUp.get(user.id).start !== null) {
        const start = client.reactionSignUp.get(user.id, 'start');
        const duration = moment.duration(moment().diff(moment(start)));
        const hoursToAdd = (Math.round(duration.asHours() * 1000) / 1000).toFixed(3);
        client.reactionSignUp.math(user.id, '+', parseFloat(hoursToAdd), 'hours.total');
        client.reactionSignUp.set(user.id, null, 'start');
      }

      const msg = client.channels.cache.get(reactionData.channelID).messages.cache.get(reactionData.messageID);
      return msg.edit(newSignUp);
    }
  }

  if (messageReaction.message.id === '781387060807729192') {
    const requestChannel = client.channels.cache.get('750150303692619817');
    const mmChannel = client.channels.cache.get('776980847273967626');
    const reactionMenu = mmChannel.messages.cache.get('781387060807729192');
    await reactionMenu.reactions.cache.first().users.fetch();
    if (reactionMenu.reactions.cache.first().count <= 1) {
      requestChannel.updateOverwrite(client.config.tradeRole, { SEND_MESSAGES: false }, 'Locking middleman channel.');
      const msg = requestChannel.messages.cache.get('782464950798516244');
      const { content } = msg;
      const splitContent = content.split('🔐');
      const contentToEdit = splitContent[1].split('\n\n');
      const newContent = '🔐 This channel is currently **locked**.';
      msg.edit(`${splitContent[0]}🔐 ${contentToEdit[0].trim()}\n\n${newContent}\n\`\`\` \n\`\`\``);
    }
  }

  const reactionRoleMenu = client.reactionRoleDB.get(messageReaction.message.id);

  // If not there isn't a type, then this is not a reaction role message.
  if (!reactionRoleMenu) {
    return;
  }

  const roleID = reactionRoleMenu.reactions[messageReaction.emoji.id || messageReaction.emoji.identifier];

  if (roleID) {
    const member = await client.guilds.cache.get(messageReaction.message.guild.id === client.config.mainGuild ? client.config.mainGuild : client.config.modMailGuild).members.fetch(user.id);
    if (member && member.roles.cache.has(roleID)) {
      member.roles.remove(roleID, '[Auto] Reaction Role Remove');
    }
  }
};
