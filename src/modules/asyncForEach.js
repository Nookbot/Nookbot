module.exports = (client) => {
  client.asyncForEach = async (array, callback) => {
    for (let i = 0; i < array.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      await callback(array[i], i, array);
    }
  };
};
