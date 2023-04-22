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
      [timeDif.years(), 'year'],
      [timeDif.months(), 'month'],
      [timeDif.days(), 'day'],
      [timeDif.hours(), 'hour'],
      [timeDif.minutes(), 'minute'],
      [timeDif.seconds(), 'second'],
    ].filter((t) => t[0] > 0).slice(0, 3).map((t) => `${t[0]} ${t[1]}${t[0] === 1 ? '' : 's'}`);

    return `${times.slice(0, times.length === 1 ? 1 : times.length - 1).join(', ')}${times.length <= 2 ? '' : ','}${times.length <= 1 ? '' : ` and ${times.slice(-1)}`}` || '0 seconds';
  };
};
