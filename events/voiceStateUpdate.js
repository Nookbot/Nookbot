/* eslint-disable consistent-return */
// eslint-disable-next-line no-unused-vars
module.exports = async (client, oldState, newState) => {
  // Check if this is related to the music channel
  if (oldState.channelID === client.config.music
      && oldState.channel.members.size === 1
      && client.voice.connections.get(oldState.guild.id)) {
    client.clearSongQueue();
    return oldState.guild.channels.cache.get(client.config.musicText).send('Everyone left the music channel, so the music stopped. Back to writing up home loans!');
  }

  // Check if this is related to a session channel
  if ((oldState.channelID && client.sessionDB.has(oldState.channelID))
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
