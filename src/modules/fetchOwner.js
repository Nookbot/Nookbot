module.exports = (client) => {
  client.fetchOwner = async () => {
    const owner = await client.users.fetch(client.config.ownerID);
    return owner;
  };
};
