module.exports = (client) => {
  client.fetchReactionModules = async () => {
    // Cache messages for reaction roles
    const reactionRoleMsgs = client.reactionRoleDB.keyArray();
    await client.asyncForEach(reactionRoleMsgs, async (msgID) => {
      const { channel } = client.reactionRoleDB.get(msgID);
      await client.channels.cache.get(channel)?.messages.fetch(msgID);
    });

    // Cache signup sheet
    const data = client.reactionSignUp.get('data');
    await client.channels.cache.get(data.channelID).messages.fetch(data.messageID);

    // Cache middleman sheet and request channel message
    const middlemanChannel = client.channels.cache.get('776980847273967626');
    const requestChannel = client.channels.cache.get('750150303692619817');
    const middlemanMsg = await middlemanChannel.messages.fetch('826305438277697567');
    await middlemanMsg.reactions.cache.first().users.fetch();
    await requestChannel.messages.fetch('782464950798516244');
  };
};
