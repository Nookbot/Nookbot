module.exports = async (client, emoji) => {
  client.emojiDB.delete(emoji.id);
};
