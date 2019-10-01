/* eslint-disable no-param-reassign */
module.exports = (client) => {
  client.getSettings = (guild) => {
    client.settings.ensure('default', client.config.defaultSettings);

    if (!guild) {
      return client.settings.get('default');
    }

    const guildConf = client.settings.get(guild.id) || {};
    return ({ ...client.settings.get('default'), ...guildConf });
  };

  client.permLevel = (message) => {
    let permName = 'User';
    let permlvl = 0;
    const permOrder = client.config.permLevels.slice(0)
      .sort((p, c) => (p.level < c.level ? 1 : -1));

    while (permOrder.length) {
      const currentlvl = permOrder.shift();

      if (currentlvl.check(client, message)) {
        permName = currentlvl.name;
        permlvl = currentlvl.level;
        break;
      }
    }
    return [permName, permlvl];
  };

  client.clean = async (clientParam, text) => {
    if (text && text.constructor.name === 'Promise') {
      text = await text;
    }
    if (typeof evaled !== 'string') {
      // eslint-disable-next-line global-require
      text = require('util').inspect(text, { depth: 1 });
    }

    text = text
      .replace(/`/g, `\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`)
      .replace(clientParam.token, 'mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0');

    return text;
  };

  client.fetchOwner = async () => {
    const owner = await client.fetchUser(client.config.ownerID);
    return owner;
  };

  // eslint-disable-next-line no-extend-native
  Object.defineProperty(String.prototype, 'toProperCase', {
    value() {
      return this.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    },
  });
};
