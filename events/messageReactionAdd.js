module.exports = async (client, messageReaction, user) => {
  if (user.bot) {
    return;
  }

  const reactionRoleMenu = client.reactionRoleDB.get(messageReaction.message.id);

  // If not there isn't a type, then this is not a reaction role message.
  if (!reactionRoleMenu) {
    return;
  }

  switch (reactionRoleMenu.type) {
    case 'remove': {
      // This reaction role menu is supposed to remove the specified role on a reaction add.
      const roleID = reactionRoleMenu.reactions[messageReaction.emoji.id || messageReaction.emoji.identifier];

      if (roleID) {
        // This reaction corresponds to a role
        const member = await client.guilds.cache.first().members.fetch(user.id);
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
        const member = await client.guilds.cache.first().members.fetch(user.id);
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
        const member = await client.guilds.cache.first().members.fetch(user.id);
        if (member && !member.roles.cache.has(roleID)) {
          member.roles.add(roleID, '[Auto] Multiple Reaction Role Add');
        }
      }
      break;
    }
    default:
      break;
  }

  // If message has a cumulative count of reactions over 4000, reset all the reactions on the message.
  let totalReactions = 0;
  messageReaction.message.reactions.cache.forEach((reaction) => { totalReactions += reaction.count; });
  if (totalReactions > 4000) {
    // Remove all reactions.
    messageReaction.message.reactions.removeAll()
      .then((message) => {
        console.log(`Removed ${totalReactions} reactions from message ${message.id}(msgID) in ${message.channel.id}(chID) and reset them.`);
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
