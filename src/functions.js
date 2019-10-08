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

  client.humanTimeBetween = (time1, time2) => {
    const timeDif = Math.floor(Math.abs(time1 - time2) / 1000);

    const times = [
      Math.floor(timeDif / 31536000),     // 31,536,000 seconds in a year (365 days)
      Math.floor(timeDif / 2592000) % 12, //  2,592,000 seconds in a month (30 days)
      Math.floor(timeDif / 86400)   % 30, //     86,400 seconds in a day (24 hours)
      Math.floor(timeDif / 3600)    % 24, //      3,600 seconds in an hour (60 mintues)
      Math.floor(timeDif / 60)      % 60, //         60 seconds in a mintues
      timeDif % 60];

    const units = ["year", "month", "day", "hour", "minute", "second"];
    
    // Grab the top 3 units of time that aren't 0
    let outTimes = ["","",""];
    let c = 0;
    for(let t = 0; t < 6; t++) {
      if (times[t] > 0) {
        outTimes[c] = `${times[t]} ${units[t]}${times[t] == 1 ? "" : "s"}`;
        c++;
        if (c == 3) break;
      }
    }
    if (c == 0) return "0 seconds";
    else if (c == 1) return outTimes[0];
    else if (c == 2) return `${outTimes[0]} and ${outTimes[1]}`;
    else if (c == 3) return `${outTimes[0]}, ${outTimes[1]}, and ${outTimes[2]}`;
  };

  // eslint-disable-next-line no-extend-native
  Object.defineProperty(String.prototype, 'toProperCase', {
    value() {
      return this.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    },
  });
};
