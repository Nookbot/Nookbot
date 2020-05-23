module.exports.run = (client, message, args) => {
  if (message.channel.id !== client.config.sesReqText) {
    client.error(message.channel, 'Command Not Available in this Channel!', `You will have to use this command in the <#${client.config.sesReqText}> channel!`);
    return;
  }

  // Number between 2 and 8
  const size = Math.max(Math.min(8, parseInt(args[0], 10) || 8), 2);

  if (message.guild.channels.cache.size < 300) {
    const sessionNumArr = client.sessionDB.array().sort((a, b) => a - b);
    let lastNum = 0;
    // Get the smallest positive number missing from the open sessions.
    sessionNumArr.find((s) => {
      if (lastNum + 1 < s) {
        return true;
      }
      lastNum = s;
      return false;
    });
    lastNum += 1;
    message.guild.channels.create(`session-${lastNum}`, {
      type: 'voice',
      bitrate: 384000,
      userLimit: size,
      parent: client.config.sesCategory,
      position: lastNum,
      reason: '[Auto] Created by session command.',
    }).then((sessionChannel) => {
      // Create sessionDB entry
      client.sessionDB.set(sessionChannel.id, lastNum);
      // Notify the user
      client.success(message.channel, 'Session Created!', `A voice channel called **session-${lastNum}** was created with **${size}** available slots! If no one is in the voice channel after 1 minute, it will be deleted.`);
      // Start a timer for 1 minute to delete the channel if no one is in it
      setTimeout(() => {
        if (sessionChannel.members.size === 0 && !sessionChannel.deleted && sessionChannel.deletable) {
          sessionChannel.delete('[Auto] No one joined this session channel.');
          client.sessionDB.delete(sessionChannel.id);
        }
      }, 60000);
    }).catch((error) => {
      client.error(message.channel, 'Failed to Create a Session!', `Nookbot failed to create a session for the following reason: ${error}`);
    });
  } else {
    // Too many channels in the server, Discord max is 500, I choose 300 since we do not need a ton of sessions clogging things up
    client.error(message.channel, 'Too Many Sessions!', 'There are too many active sessions to create another!');
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['sess', 'voicesession', 'voice'],
  permLevel: 'User',
  cooldown: 120, // 2 mins
};

module.exports.help = {
  name: 'session',
  category: 'game',
  description: 'Create a voice channel to play with other members',
  usage: 'session <number>',
  details: '<number> => The number of slots to allow in the voice channel.',
};
