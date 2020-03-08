/* eslint-disable consistent-return */
// eslint-disable-next-line no-unused-vars
module.exports = async (client, oldState, newState) => {
  // Check if this is the last user leaving the voice channel, and if the bot is in it
  if (client.voice.connections.get(oldState.guild.id)
      && oldState.guild.channels.cache.get(client.getSettings(oldState.guild).music).members.size === 1) {
    // If connection is not null, disconnect it
    client.clearSongQueue();
    return oldState.guild.channels.cache.get(client.getSettings(oldState.guild).musicText).send('Everyone left the music channel, so the music stopped. Back to writing up home loans!');
  }
};
