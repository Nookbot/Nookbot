const Discord = require('discord.js');
const cheerio = require('cheerio');
const request = require('request');

// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  const search = args.join(' ');
  const link = `https://duckduckgo.com/?q=%5C${escape(search)}+site%3Anookipedia.com`;

  const waitingMsg = await message.channel.send('Please wait while Nookbot counts its bells...');

  request(link, (err, res, html) => {
    if (err || res.statusCode !== 200) {
      waitingMsg.delete();
      return message.error('Invalid Search Terms!', 'Please check your spelling and that what you searched for actually exists!');
    }

    const nookLink = html.match(/(?<=uddg=)[^']+/);

    request(unescape(nookLink), (err2, res2, html2) => {
      if (err2 || res2.statusCode !== 200) {
        waitingMsg.delete();
        return message.error('Invalid Search Terms!', 'Please check your spelling and that what you searched for actually exists!');
      }
      
      const $ = cheerio.load(html2);
      const output = $('.mw-parser-output');
      const outputBio = output.find('p');
      const image = output.find('table')
        .eq(1)
        .find('a')
        .find('img')
        .attr('src');

      let bio = outputBio.eq(0).text();

      if (bio.indexOf(' ') > 30) {
        bio = outputBio.eq(1).text();
      }

      const embed = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setTimestamp()
        .setAuthor(message.author.tag, message.author.displayAvatarURL)
        .setTitle(fixedSearch)
        .setDescription(`${bio}[Read More](${nookLink})`)
        .setImage(`https://nookipedia.com${image}`)
        .setFooter('Info from Nookipedia', client.user.displayAvatarURL);

      waitingMsg.delete();
      return message.channel.send(embed);
    });
  });
};

module.exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['character', 'char', 'villager', 'vil', 'item'],
  permLevel: 'User',
  args: 1,
};

module.exports.help = {
  name: 'wiki',
  category: 'game',
  description: 'Gets info from the wiki on specified search',
  usage: 'wiki <search>',
};
