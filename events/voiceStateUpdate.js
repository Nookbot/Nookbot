// eslint-disable-next-line no-unused-vars
module.exports = async (client, oldMember, newMember) => {
  // Check if this is the last user leaving the voice channel, and if the bot is in it
  if (client.voiceConnections.get(oldMember.guild.id)
      && oldMember.guild.channels.get(client.getSettings(oldMember.guild).voice).members.size === 1) {
    // If connection is not null, disconnect it
    client.songQueue.connection && client.songQueue.connection.disconnect();
    client.songQueue.connection = null;
    client.songQueue.voiceChannel = null;
    client.songQueue.infoMessage = null;
    client.songQueue.playing = false;
    return oldMember.guild.channels.get(client.getSettings(oldMember.guild).voiceText).send('Everyone left voice chat, so the music stopped.');
  }
};