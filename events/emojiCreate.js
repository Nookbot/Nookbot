module.exports = async (client, emoji) => {
  client.emojiDB.set(emoji.id, 0);
};
