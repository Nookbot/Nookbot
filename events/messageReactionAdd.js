/* eslint-disable consistent-return */
module.exports = async (client, messageReaction, user) => {
  if (user.bot || !messageReaction.message.inGuild()) {
    return;
  }

  const reactionData = client.reactionSignUp.get('data');

  if (reactionData.messageID === messageReaction.message.id) {
    if (reactionData.reactions.includes(messageReaction.emoji.name)) {
      const index = reactionData.reactions.findIndex((s) => s === messageReaction.emoji.name);
      const names = reactionData.names[index];
      const ids = reactionData.ids[index];
      const member = messageReaction.message.guild.members.cache.get(user.id) || await messageReaction.message.guild.members.fetch(user.id);
      names.push(member.displayName);
      ids.push(user.id);

      let newSignUp = '__**•• Sign Up Sheet ••**__\n\n';
      for (let i = 0; i < reactionData.signUpSheet.length; i++) {
        if (i === index) {
          newSignUp += `${reactionData.signUpSheet[i]}${names.join(', ')}\n`;
        } else {
          newSignUp += `${reactionData.signUpSheet[i]}${reactionData.names[i].join(', ')}\n`;
        }
      }
      newSignUp += "\n* *Please sign up with other channels.*\n** *If the reactions aren't showing correctly, refreshing your client (CTRL + R) may solve the issue!*";

      client.reactionSignUp.set('data', names, `names[${index}]`);
      client.reactionSignUp.set('data', ids, `ids[${index}]`);
      const mod = client.reactionSignUp.ensure(user.id, {
        hours: { total: 0 }, channels: [], start: null,
      });

      if (mod.channels.length === 0) {
        client.reactionSignUp.set(user.id, Date.now(), 'start');
      }

      if (!mod.channels.find((c) => Object.keys(c)[0] === messageReaction.emoji.name)) {
        client.reactionSignUp.push(user.id, {
          [messageReaction.emoji.name]: Date.now(),
        }, 'channels');
      }

      const msg = client.channels.cache.get(reactionData.channelID).messages.cache.get(reactionData.messageID);
      return msg.edit(newSignUp);
    }
  }

  if (messageReaction.message.id === '826305438277697567' && messageReaction.emoji.id === '756701911163600977') {
    client.mmSignUp.ensure(user.id, { hours: 0, start: null });
    client.mmSignUp.set(user.id, Date.now(), 'start');

    await messageReaction.users.fetch();
    const names = messageReaction.users.cache.filter((u) => !u.bot).map((u) => {
      let mmMember = messageReaction.message.guild.members.cache.get(u.id);
      if (!mmMember) {
        messageReaction.message.guild.members.fetch(u.id)
          .then((mm) => {
            mmMember = mm;
          });
      }
      return mmMember.displayName;
    });
    const mmAvailableNum = names.length;
    const signUpMsgContent = messageReaction.message.content;
    const splitSignUpContent = signUpMsgContent.split(') ••__**');
    await messageReaction.message.edit(`${splitSignUpContent[0].replace(/\(\d+/, `(${mmAvailableNum}`)}) ••__**\n${names.join('\n')}`);

    // Request channel unlocking and editing
    const requestChannel = client.channels.cache.get('750150303692619817');
    if (!requestChannel.permissionsFor(client.config.tradeRole).has('SEND_MESSAGES')) {
      requestChannel.permissionOverwrites.edit(client.config.tradeRole, { SEND_MESSAGES: true });
      const msg = requestChannel.messages.cache.get('782464950798516244');
      const { content } = msg;
      const splitContent = content.split('🔐');
      const contentToEdit = splitContent[1].split('\n\n');
      const newContent = '🔓 This channel is currently **unlocked**.';
      await msg.edit(`${splitContent[0].replace(/[\u200B-\u200D\uFEFF]/g, '')}🔐 ${contentToEdit[0].trim()}\n\n${newContent}\n\`\`\` \n\`\`\``);
    }
  }

  const reactionRoleMenu = client.reactionRoleDB.get(messageReaction.message.id);

  // If there isn't a type, then this is not a reaction role message.
  if (!reactionRoleMenu) {
    return;
  }

  switch (reactionRoleMenu.type) {
    case 'remove': {
      // This reaction role menu is supposed to remove the specified role on a reaction add.
      const roleID = reactionRoleMenu.reactions[messageReaction.emoji.id || messageReaction.emoji.identifier];

      if (roleID) {
        // This reaction corresponds to a role
        const member = await client.guilds.cache.get(messageReaction.message.guildId === client.config.mainGuild ? client.config.mainGuild : client.config.modMailGuild).members.fetch(user.id);
        if (member && member.roles.cache.has(roleID)) {
          member.roles.remove(roleID, '[Auto] Remove Reaction Role');
        }
      }
      break;
    }
    case 'exclusive': {
      // Members can only have one of the roles in this menu.
      const roleID = reactionRoleMenu.reactions[messageReaction.emoji.id || messageReaction.emoji.identifier];

      if (roleID) {
        const member = await client.guilds.cache.get(messageReaction.message.guildId === client.config.mainGuild ? client.config.mainGuild : client.config.modMailGuild).members.fetch(user.id);
        if (member) {
          // Check if they have any of the other roles in this list and remove them.
          const rolesToRemove = [];
          const rolesInGroup = Object.values(reactionRoleMenu.reactions);
          member.roles.cache.forEach((role, rID) => {
            if (rID !== roleID && rolesInGroup.includes(rID)) {
              rolesToRemove.push(rID);
            }
          });
          if (rolesToRemove.length !== 0) {
            await member.roles.remove(rolesToRemove, '[Auto] Exclusive Reaction Role Remove');
          }
          if (!member.roles.cache.has(roleID)) {
            member.roles.add(roleID, '[Auto] Exclusive Reaction Role Add');
          }
        }
      }
      break;
    }
    case 'multiple': {
      // Members can have any number of the roles in this menu.
      const roleID = reactionRoleMenu.reactions[messageReaction.emoji.id || messageReaction.emoji.identifier];

      if (roleID) {
        const member = await client.guilds.cache.get(messageReaction.message.guildId === client.config.mainGuild ? client.config.mainGuild : client.config.modMailGuild).members.fetch(user.id);
        if (member && !member.roles.cache.has(roleID)) {
          member.roles.add(roleID, '[Auto] Multiple Reaction Role Add');
        }
      }
      break;
    }
    case 'restricted': {
      // Members must be in the server for a certain amount of time before they can recieve roles from this menu.
      const roleID = reactionRoleMenu.reactions[messageReaction.emoji.id || messageReaction.emoji.identifier];

      if (roleID) {
        const member = await client.guilds.cache.get(messageReaction.message.guildId === client.config.mainGuild ? client.config.mainGuild : client.config.modMailGuild).members.fetch(user.id);
        if (member && (Date.now() - member.joinedTimestamp) > reactionRoleMenu.time) {
          member.roles.add(roleID, '[Auto] Restricted Reaction Role Add');
        }
      }
      break;
    }
    default:
      break;
  }

  // If message has a cumulative count of reactions over 500, reset all the reactions on the message.
  let totalReactions = 0;
  messageReaction.message.reactions.cache.forEach((reaction) => { totalReactions += reaction.count; });
  if (totalReactions > 500) {
    // Remove all reactions.
    messageReaction.message.reactions.removeAll()
      .then((message) => {
        console.log(`Removed ${totalReactions} reactions from message ${message.id}(msgID) in ${message.channelId}(chID) and reset them.`);
        // Add back one of each reaction.
        client.asyncForEach(Object.keys(reactionRoleMenu.reactions), async (emoji) => {
          await message.react(emoji);
        });
      })
      .catch((err) => {
        // Failed to remove all reactions.
        console.error(err);
      });
  }
};
