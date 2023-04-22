/* eslint-disable consistent-return */
// eslint-disable-next-line no-unused-vars
module.exports = async (client, oldState, newState) => {
  // Check if this is related to a session channel
  if ((oldState.channelId && client.sessionDB.has(oldState.channelId))
      && oldState.channel.members.size === 0) {
    // Session is empty, delete it
    oldState.channel.delete('[Auto] Last member left session channel.').then((delChannel) => {
      // Delete sessionDB entry
      client.sessionDB.delete(delChannel.id);
    }).catch((error) => {
      console.error(error);
    });
  }
};
