/* eslint-disable no-param-reassign */
module.exports = (client) => {
  client.timeRegex = /^([0-9]+)(?:([dhms])[a-z]*)?/i;

  client.stringToTime = (str) => {
    let match;
    let ms = 0;

    str = str.trim();

    while (str !== '' && (match = str.match(client.timeRegex)) !== null) {
      if (match[2] === 'd') ms += match[1] * 1000 * 60 * 60 * 24;
      else if (match[2] === 'h') ms += match[1] * 1000 * 60 * 60;
      else if (match[2] === 'm') ms += match[1] * 1000 * 60;
      else if (match[2] === 's' || !match[2]) ms += match[1] * 1000;

      str = str.slice(match[0].length);
    }

    if (str !== '') {
      return null;
    }

    return ms;
  };
};
