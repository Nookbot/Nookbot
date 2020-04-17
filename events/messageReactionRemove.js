module.exports = async (client, messageReaction, user) => {
  if (user.bot) {
    return;
  }

  const { type, reactions } = client.reactionRoleDB.get(messageReaction.message.id);

  // If not there isn't a type, then this is not a reaction role message.
  if (!type) {
    return;
  }

  const roleID = reactions[messageReaction.emoji.id || messageReaction.emoji.identifier];

  if (roleID) {
    const member = await client.guilds.cache.first().members.fetch(user.id);
    if (member && member.roles.cache.has(roleID)) {
      member.roles.remove(roleID, '[Auto] Reaction Role Remove');
    }
  }
};