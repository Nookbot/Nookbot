/* eslint-disable no-param-reassign */
const moment = require('moment');

module.exports = (client) => {
  client.humanTimeBetween = (time1, time2) => {
    if (time1 < time2) {
      const temp = time1;
      time1 = time2;
      time2 = temp;
    }
    const timeDif = moment.duration(moment(time1).diff(moment(time2)));

    const times = [
      timeDif.years(),
      timeDif.months(),
      timeDif.days(),
      timeDif.hours(),
      timeDif.minutes(),
      timeDif.seconds(),
    ];

    const units = ['year', 'month', 'day', 'hour', 'minute', 'second'];

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

    return outTimes || '0 seconds';
  };
};
