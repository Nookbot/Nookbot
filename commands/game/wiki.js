const Discord = require('discord.js');
const cheerio = require('cheerio');
const request = require('request');

// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  const search = args.join('_');
  const fixedChar = search.replace(/_/, ' ').toProperCase();
  const link = `https://nookipedia.com/wiki/${search}`;

  const waitingMsg = await message.channel.send('Please wait while Nookbot counts its bells...');

  request(link, (err, res, html) => {
    if (err || res.statusCode !== 200) {
      return message.error('Invalid Search Terms!', 'Please check your spelling and that what you searched for actually exists!');
    }

    const $ = cheerio.load(html);
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
      .setTitle(fixedChar)
      .setDescription(`${bio}[Read More](${link})`)
      .setImage(`https://nookipedia.com${image}`)
      .setFooter(`Info from Nookipedia | ${client.version}`, client.user.displayAvatarURL);

    return waitingMsg.edit(embed);
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
