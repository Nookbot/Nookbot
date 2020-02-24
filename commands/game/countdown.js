const moment = require('moment');

const timezones = require('../../src/timezones.json');

// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  const tz = args[0] ? args[0].toUpperCase() : 'LINT';
  let offset = timezones[tz];

  if (offset === undefined) {
    offset = 14;
  }

  const timeDif = moment.duration(moment([2020, 2, 20]).diff(moment().add(offset, 'hours').startOf('minute')));

  const times = [
    Math.floor(timeDif.asDays()),
    timeDif.hours(),
    timeDif.minutes(),
  ];

  const units = ['day', 'hour', 'minute'];

  // Grab the top 3 units of time that aren't 0
  let outTimes = '';
  let c = 0;
  for (let t = 0; t < units.length; t++) {
    if (times[t] > 0) {
      outTimes += `${c === 1 ? '|' : ''}${c === 2 ? '=' : ''}${times[t]} ${units[t]}${times[t] === 1 ? '' : 's'}`;
      c += 1;
      if (c === 3) {
        break;
      }
    }
  }

  if (outTimes.includes('=')) {
    outTimes = outTimes.replace('|', ', ').replace('=', ', and ');
  } else {
    outTimes = outTimes.replace('|', ' and ');
  }

  return message.channel.send(`**Animal Crossing: New Horizons** releases in **${outTimes}**! (UTC${offset >= 0 ? '+' : ''}${offset})`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['cd', 'count', 'release'],
  permLevel: 'User',
};

module.exports.help = {
  name: 'countdown',
  category: 'game',
  description: "Gets the current countdown from AC:NH's release",
  usage: 'countdown <timezone>',
  details: '<timezone> => The timezone to get the countdown for. Ex - EST, GMT, PST, etc.',
};
