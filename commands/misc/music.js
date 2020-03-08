/* eslint-disable consistent-return */

const ytdl = require('ytdl-core-discord');
const ytpl = require('ytpl');
const { findBestMatch: findBest } = require('string-similarity');

module.exports.run = async (client, message, args, level, Discord) => {
  // Secret update command to redownload the update, only Tristan can use
  // Tristan's UserID
  if (args[0] === 'update') {
    if (message.author.id === '170307091628556289' || message.author.id === '403103000630919169') {
      return ytpl('PLmJ4dQSfFie-81me0jlzewxPIxKuO2-sI', { limit: 0 }, (err, playlistObj) => {
        if (err) {
          console.error(err);
          return client.error(message.channel, 'Error Loading Playlist!', 'The playlist failed to load and the song was not added.');
        }

        // Clear the database of old videos
        client.playlist.deleteAll();

        // Add the new playlist to the database
        playlistObj.items.forEach((video) => {
          client.playlist.set(video.id, video.title.toLowerCase()
            .replace(/animal|crossing|ost|orginal|soundtrack|[^\w]/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim());
        });

        return client.success(message.channel, 'Playlist Database Updated!', 'The newest version of the playlist has been loaded into the bot\'s database!');
      });
    }
    return client.error(message.channel, 'Permission Denied!', 'You do not have permission to update the playlist database!');
  }

  // The music commands must be used in voice text
  const voiceChannel = message.member && message.member.voice.channel;
  if (!voiceChannel || voiceChannel.id !== client.getSettings(message.guild).music || client.getSettings(message.guild).musicText !== message.channel.id) {
    return client.error(message.channel, 'Command Unavailable!', `To use this command, you must use the <#${client.getSettings(message.guild).musicText}> channel and currently be in the music channel.`);
  }

  // Helper function to update the music bot info
  const updateInfo = async (updateTitle, updateDesc) => {
    // Prepare the embed
    const embed = new Discord.MessageEmbed()
      .setTitle('__**•• DJ Nookbot ••**__')
      .setDescription(`Played: ${client.songQueue.played} song${client.songQueue.played !== 1 ? 's' : ''} | Total Time: ${client.humanTimeBetween(0, client.songQueue.timePlayed * 1000) || '0 seconds'}
Playing: ${client.songQueue.playing ? client.emoji.checkMark : client.emoji.redX} | Shuffle Mode: ${client.songQueue.shuffle ? client.emoji.checkMark : client.emoji.redX}`)
      .setColor('#1de9b6')
      .setTimestamp();

    // Add the queued songs as fields
    client.songQueue.songs.slice(0, 4).forEach((s, i) => {
      if (i === 0) {
        embed.addField('**Now Playing**', `Title: ${s.title}\nAuthor: ${s.author}\nLength: ${s.time}\nLink: <${s.url}>`);
      } else {
        embed.addField(`**Queue ${i}**`, `Title: ${s.title}\nAuthor: ${s.author}\nLength: ${s.time}\nLink: <${s.url}>`, true);
      }
    });

    // If there are more than 4 songs in the queue, count them and display the count in its own field
    const laterCount = client.songQueue.songs.slice(4).length;
    if (laterCount !== 0) {
      embed.addField('**Later**', `With ${laterCount} more not shown.`, true);
    }

    // Update the recent activity, if there is any, or keep it as the old update
    if (updateTitle && updateDesc) {
      embed.addField(`**${updateTitle}**`, updateDesc);
      client.songQueue.lastUpdateTitle = updateTitle;
      client.songQueue.lastUpdateDesc = updateDesc;
    } else if (client.songQueue.lastUpdateTitle && client.songQueue.lastUpdateDesc) {
      embed.addField(`**${client.songQueue.lastUpdateTitle}**`, client.songQueue.lastUpdateDesc);
    }

    // Check if there is an old info message, and delete the old and make a new one
    if (client.songQueue.infoMessage) {
      client.songQueue.infoMessage.delete();
    }
    client.songQueue.infoMessage = await message.channel.send(embed);
  };

  // Helper function to make song info from video ID
  const infoFromID = async (songID) => {
    const info = await ytdl.getBasicInfo(songID);
    return {
      title: info.title,
      author: info.author.name,
      time: `${Math.floor(parseInt(info.length_seconds, 10) / 60)}:${(parseInt(info.length_seconds, 10) % 60).toString().padStart(2, 0)}`,
      timeNum: parseInt(info.length_seconds, 10),
      url: info.video_url,
    };
  };

  switch (args[0]) {
    case 'play':
      // If there are more arguments, we need to find the song they searched and add it to the queue
      if (args.length > 1) {
        // Grab the list of video titles
        const titles = client.playlist.map((v) => v);
        // Sort the playlist based on the search, and return the top result
        const search = args.slice(1).join(' ').toLowerCase()
          .replace(/animal|crossing|ost|orginal|soundtrack|[^\w]/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const titleName = findBest(search, titles).bestMatch.target;
        const songID = client.playlist.findKey((v) => v === titleName);
        const info = await infoFromID(songID);
        // If no songs are in the queue, start playing
        if (client.songQueue.songs.length === 0) {
          client.songQueue.playing = true;
        }
        client.songQueue.songs.push(info);
        updateInfo('Song Added!', `Your search matched best with **${info.title}**, and was added to the queue!`);
      }

      if (!client.songQueue.connection) {
        // If song queue is empty, that means play was called while the bot wasn't in the channel and without a song search,
        // and we need to check if shuffle mode is on and pick a random song and add it to the queue if it is
        if (client.songQueue.songs.length === 0) {
          client.songQueue.playing = true;
          client.songQueue.shuffle = true;
          const info = await infoFromID(client.playlist.randomKey());
          client.songQueue.songs.push(info);
          updateInfo();
        }

        client.songQueue.playing = true;
        client.songQueue.voiceChannel = voiceChannel;
        client.songQueue.connection = await voiceChannel.join();

        // Defining a play function so it can call itself recursively
        const play = async (song) => {
          // If a song wasn't given leave voice channel, or if the connection has been destroyed
          if (!song || !client.songQueue.connection) {
            client.clearSongQueue();
            return;
          }

          client.songQueue.connection.play(await ytdl(song.url, { quality: 'highestaudio', highWaterMark: 4194304 }), { type: 'opus', volume: false, bitrate: 'auto' })
            .once('finish', (reason) => {
              if (!client.songQueue.stopping && client.songQueue.connection) {
                if (reason !== 'skip') {
                  client.songQueue.played += 1;
                  client.songQueue.timePlayed += client.songQueue.songs[0].timeNum;
                }
                client.songQueue.songs.shift();
                // If the queue is empty and shuffle mode is on, pick a random song and add it to the queue
                if (client.songQueue.songs.length === 0 && client.songQueue.shuffle) {
                  infoFromID(client.playlist.randomKey()).then((i) => {
                    client.songQueue.songs.push(i);
                    if (reason === 'skip') {
                      updateInfo('Song Skipped!', 'The current song was skipped!');
                    } else {
                      updateInfo();
                    }
                    play(client.songQueue.songs[0]);
                  });
                } else {
                  if (reason === 'skip') {
                    updateInfo('Song Skipped!', 'The current song was skipped!');
                  } else {
                    updateInfo();
                  }
                  play(client.songQueue.songs[0]);
                }
              }
            });
        };

        // Play the song
        return play(client.songQueue.songs[0]);
      }
      if (args.length === 1 && client.songQueue.connection.dispatcher && client.songQueue.connection.dispatcher.paused) {
        // If the connection object is present, then see if the stream is paused, and resume it
        client.songQueue.playing = true;
        client.songQueue.connection.dispatcher.resume();
        return updateInfo('Song Resumed!', 'The current song has resumed playing!');
      }
      if (args.length === 1) {
        return updateInfo('Song Already Playing!', 'A song is already playing, you can add new songs with \`.music play <song name>\`.');
      }
      return;
    case 'skip':
      // Check if there's a song to skip
      if (client.songQueue.songs.length === 0) {
        return client.error(message.channel, 'No Song To Skip!', 'No song is currently playing, so there is nothing to skip!');
      }

      // End the current song, and this will load the next song if any are in the queue
      if (client.songQueue.connection && client.songQueue.connection.dispatcher) {
        client.songQueue.connection.dispatcher.end('skip');
      }
      return;
    case 'pause':
      // Check if a song is currently playing to pause
      if (client.songQueue.playing) {
        client.songQueue.playing = false;
        client.songQueue.connection.dispatcher.pause(true);
        return updateInfo('Song Paused!', 'The current song was paused! Resume it with \`.music play\`.');
      }

      if (client.songQueue.songs.length === 0) {
        return client.error(message.channel, 'No Song Playing!', 'There is no song to pause, or the song is already paused!');
      }

      if (client.songQueue.connection && client.songQueue.connection.dispatcher && client.songQueue.connection.dispatcher.paused) {
        return updateInfo('Song Already Paused!', 'The song is already paused! Resume it with \`.music play\`.');
      }
      break;
    case 'stop':
      if (client.songQueue.connection) {
        // If connection is not null, disconnect it
        client.clearSongQueue();
        return client.success(message.channel, 'Music Stopped!', 'The current song queue was ended!');
      }
      return client.error(message.channel, 'Nothing to Stop!', 'There is nothing playing right now, so there is nothing to stop!');
    case 'shuffle':
      // Toggle shuffle mode
      if (client.songQueue.connection) {
        client.songQueue.shuffle = !client.songQueue.shuffle;
        if (client.songQueue.shuffle) {
          return updateInfo('Shuffle Mode On!', 'When the song queue is empty, songs will play randomly!');
        }
        return updateInfo('Shuffle Mode Off!', 'When the song queue is empty, the bot will leave the voice channel!');
      }
      return client.error(message.channel, 'Music Bot Inactive!', 'The music bot must bust be connected to the voice channel to change the shuffle mode!');
    case 'info':
      return updateInfo();
    default:
      return client.error(message.channel, 'Wrong Sub Command!', `The sub command **${args[0]}** is not valid. Use \`.help music\` to list the valid sub commands.`);
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['song'],
  permLevel: 'User',
  args: 1,
};

module.exports.help = {
  name: 'music',
  category: 'misc',
  description: 'Play Animal Crossing music in the voice channel',
  usage: 'music <play|skip|pause|stop|shuffle|info> <song name>',
  details: '<play> => Add a song by name to the queue, or resume the paused queue.\n<skip> => Skip the current song.\n<pause> => Pause the current song.\n<stop> => Delete the current song queue and remove the bot from the voice channel.\n<shuffle> => Toggle whether the bot will play a random song when the queue is empty.\n<info> => Display info about the current song, the songs in the queue, and the status of shuffle mode.',
};
