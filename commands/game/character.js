const Discord = require('discord.js');
const cheerio = require('cheerio');
const request = require('request');

// eslint-disable-next-line no-unused-vars
module.exports.run = (client, message, args, level) => {
  const character = args.join('_');
  const fixedChar = character.replace(/_/, ' ').toProperCase();
  const link = `https://nookipedia.com/wiki/${character}`;

  request(link, (err, res, html) => {
    if (err || res.statusCode !== 200) {
      return message.error('Invalid Character!', 'Please check your spelling and that the character actually exists');
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

    return message.channel.send(embed);
  });
};

module.exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['char'],
  permLevel: 'User',
  args: 1,
};

module.exports.help = {
  name: 'character',
  category: 'game',
  description: 'Gets info on the specified AC character',
  usage: 'character <character>',
};
