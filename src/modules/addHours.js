module.exports = (client) => {
  client.addHours = (moderator) => {
    const data = client.reactionSignUp.get('data');
    const totalHours = moderator.hours.total;
    const channelHours = [];
    const channelsToAdd = Object.keys(moderator.hours).sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
    for (let i = 0; i < channelsToAdd.length; i++) {
      if (channelsToAdd[i] !== 'total') {
        const hours = moderator.hours[channelsToAdd[i]];
        let channelInfo = data.signUpSheet.find((e) => e.includes(channelsToAdd[i])).split('\n');
        channelInfo = channelInfo.length > 1 ? channelInfo[1] : channelInfo[0];
        channelInfo = channelInfo.split('(')[0].trim();

        const percent = ((hours / totalHours) * 100).toFixed(2);
        channelHours.push(`> ${channelInfo} - \`${hours} hours (${percent}%)\``);
      }
    }
    return { totalHours, channelHours };
  };
};
