const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { findBestMatch: findBest } = require('string-similarity');

module.exports.run = async (client, message, args) => {
  // The music commands must be used in voice text
  const { voiceChannel } = message.member;
  if (!voiceChannel || client.getSettings(message.guild).voiceText !== message.channel.id) {
    return client.error(message.channel, 'Command Unavailable!', `To use this command, you must use the <#${client.getSettings(message.guild).voiceText}> channel and currently be in the voice channel.`);
  }

  switch (args[0]) {
    case 'play':
      // If there are more arguments, we need to find the song they searched and add it to the queue
      if (args.length > 1) {
        // Load the playlist link if it has been a day since last updated, or it doesn't exist
        const plistCount = client.playlist.count;
        if (plistCount === 0 || Date.now() - (client.songQueue.lastPlaylistUpdate || 0) > 86400000) {
          ytpl('PLmJ4dQSfFie-81me0jlzewxPIxKuO2-sI', { limit: 0 }, (err, playlistObj) => {
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

            client.songQueue.lastPlaylistUpdate = Date.now();
          });
        }

        // Grab the list of video titles
        const titles = client.playlist.map((v) => v);
        // Sort the playlist based on the search, and return the top result
        const search = args.slice(1).join(' ').toLowerCase()
          .replace(/animal|crossing|ost|orginal|soundtrack|[^\w]/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const titleName = findBest(search, titles).bestMatch.target;
        const songID = client.playlist.findKey((v) => v === titleName);
        client.songQueue.songs.push(songID);
      }

      if (!client.songQueue.connection) {
        // If song queue is empty, that means play was called while the bot wasn't in the channel and without a song search,
        // and we need to check if shuffle mode is on and pick a random song and add it to the queue if it is
        if (client.songQueue.songs.length === 0) {
          if (client.songQueue.shuffle) {
            client.songQueue.songs.push(client.playlist.randomKey());
          } else {
            return client.error(message.channel, 'Not in Shuffle Mode!', 'To play songs randomly, I need to be in shuffle mode! Use \`.music shuffle\`.');
          }
        }

        client.songQueue.playing = true;
        client.songQueue.voiceChannel = voiceChannel;
        client.songQueue.connection = await voiceChannel.join();

        // Defining a play function so it can call itself recursively
        const play = (song = client.songQueue.songs[0]) => {
          // If a song wasn't given leave voice channel, or if the connection has been destroyed
          if (!song || !client.songQueue.connection) {
            client.songQueue.playing = false;
            client.songQueue.songs = [];
            client.songQueue.voiceChannel = null;
            return;
          }

          client.songQueue.connection.playStream(ytdl(song, { quality: 'highestaudio' })
            .on('info', (info) => message.channel.send(`__**Now Playing**__\nTitle: ${info.title}\nAuthor: ${info.author.name}\nLink: <${info.video_url}>`)))
            .on('end', () => {
              client.songQueue.songs.shift();
              // If the queue is empty and shuffle mode is on, pick a random song and add it to the queue
              if (client.songQueue.songs.length === 0 && client.songQueue.shuffle) {
                client.songQueue.songs.push(client.playlist.randomKey());
              }
              play(client.songQueue.songs[0]);
            })
            .on('error', (error) => {
              console.error(error);
            });
        };

        // Play the song
        play(client.songQueue.songs[0]);
      } else if (client.songQueue.connection.dispatcher.paused) {
        // If the connection object is present, then see if the stream is paused, and resume it
        client.songQueue.connection.dispatcher.resume();
      }
      return;
    case 'skip':
      // Check if there's a song to skip
      if (!client.songQueue.songs) {
        return client.error(message.channel, 'No Song To Skip!', 'No song is currently playing, so there is nothing to skip!');
      }

      // End the current song, and this will load the next song if any are in the queue
      if (client.songQueue.connection && client.songQueue.connection.dispatcher) client.songQueue.connection.dispatcher.end();
      return;
    case 'pause':
      // Check if a song is currently playing to pause
      if (client.songQueue.playing) {
        client.songQueue.playing = false;
        client.songQueue.connection.dispatcher.pause();
        return client.success(message.channel, 'Song Paused!', 'The current song was paused! Resume it with \`.music play\`.');
      }
      return client.error(message.channel, 'No Song Playing!', 'There is no song to pause, or the song is already paused!');
    case 'stop':
      // Check if there is a queue, or if shuffle is on and destroy the connection
      if (client.songQueue.connection) {
        client.songQueue.voiceChannel.leave();
        client.songQueue.connection.disconnect();
        client.songQueue.playing = false;
        client.songQueue.songs = [];
        client.songQueue.voiceChannel = null;
        client.songQueue.connection = null;
        return client.success(message.channel, 'Music Stopped!', 'The current song queue');
      }
      return client.error(message.channel, 'Nothing to Stop!', 'There is nothing playing right now, so there is nothing to stop!');
    case 'shuffle':
      // Toggle shuffle mode
      client.songQueue.shuffle = !client.songQueue.shuffle;
      if (client.songQueue.shuffle) {
        return client.success(message.channel, 'Shuffle Mode On!', 'When the song queue is empty, songs will play randomly!');
      }
      return client.error(message.channel, 'Shuffle Mode Off!', 'When the song queue is empty, the bot will leave the voice channel!');
    case 'info':
      // If a song is in the queue, display basic info about it and the others songs in the queue in voice text
      if (client.songQueue.songs.length !== 0) {
        const info = await ytdl.getInfo(client.songQueue.songs[0]);
        message.channel.send(`__**Now Playing**__\nTitle: ${info.title}\nAuthor: ${info.author.name}\nLink: <${info.video_url}>`)
      }
      break;
    default:
      break;
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
