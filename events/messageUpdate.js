const Discord = require('discord.js');

module.exports = async (client, oldMessage, newMessage) => {
  // Ignore all bots and make sure the content of the message changed.
  if (!newMessage.inGuild() || newMessage.author.bot || oldMessage.content === newMessage.content
      || client.config.ignoreChannel.includes(newMessage.channelId)
      || client.config.ignoreMember.includes(newMessage.author.id)
      || newMessage.guild.id !== client.config.mainGuild) {
    return;
  }

  // Description value length limit for embeds is 1024
  const oldDemark = oldMessage.content.replace(/(\*|~|_|`)/g, '\\$1');
  const newDemark = newMessage.content.replace(/(\*|~|_|`)/g, '\\$1');
  const oldMsg = oldDemark.length > 499 ? `${oldDemark.slice(0, 496)}...` : oldDemark;
  const newMsg = newDemark.length > 499 ? `${newDemark.slice(0, 496)}...` : newDemark;

  const embed = new Discord.MessageEmbed()
    .setColor('#00e5ff')
    .setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL())
    .setDescription(`[Jump to message in](${newMessage.url} 'Jump') <#${newMessage.channelId}>`)
    .setTimestamp()
    .setFooter(`ID: ${newMessage.author.id}`)
    .addField('**Message Edited**', `**Before:** ${oldMsg}\n**After:** ${newMsg}`)
    .addField('**Posted**', `<t:${Math.floor(oldMessage.createdTimestamp / 1000)}>`);

  newMessage.guild.channels.cache.get(client.config.actionLog).send({ embeds: [embed] });

  // Banned Words
  if (level[1] < 2) {
    const tokens = newMessage.content.replace(/[\u200B-\u200D\uFEFF\uDB40-\uDB43\uDC00-\uDFFF]/ug, '').split(/ +/g);
    let ban = false;
    let del = false;
    let sanrio = false;
    let match;

    for (let index = 0; index < tokens.length; index++) {
      if (ban) {
        break;
      }
      const matches = client.bannedWordsFilter.search(tokens[index]);

      for (let mIndex = 0; mIndex < matches.length; mIndex++) {
        const chkMatch = client.bannedWordsDB.find((w) => w.word === matches[mIndex].original && w.phrase.join(' ') === matches[mIndex].item.phrase.join(' '));

        // Only check if we're not already deleting this message, or the matched word is an autoBan
        if (!del || chkMatch.autoBan) {
          let chkDel = false;
          let matchedPhrase = true;
          if (chkMatch.phrase.length !== 0) {
            if (chkMatch.phrase.length < (tokens.length - index)) {
              for (let i = 0; i < chkMatch.phrase.length; i++) {
                if (tokens[index + (i + 1)].toLowerCase() !== chkMatch.phrase[i].toLowerCase()) {
                  matchedPhrase = false;
                  break;
                }
              }
            } else {
              matchedPhrase = false;
            }
          }

          if (matchedPhrase) {
            if (chkMatch.blockedChannels && chkMatch.blockedChannels.length !== 0) {
              if (chkMatch.blockedChannels.includes(newMessage.channelId)) {
                if (['sanrio', 'toby', 'chelsea', 'chai', 'étoile', 'etoile', 'marty', 'rilla'].includes(chkMatch.word)) {
                  sanrio = true;
                }
                chkDel = true;
              }
            } else {
              chkDel = true;
            }
          }

          if (!del && chkDel) {
            // This is to save the first match that caused the message to get deleted or banned
            match = chkMatch;
            del = chkDel;
          }

          if (chkDel && chkMatch.autoBan) {
            match = chkMatch;
            ban = true;
            break; // Break on autoBan because we don't need to check for any other banned words.
          }
        }
      }
    }
  }
};
