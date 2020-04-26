const tools = require('../../data/acnh-tools.json')

module.exports.run = async (client, message, args, level, Discord) => {

    if (!tools || tools.length === 0) return;

    // embed
    const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setColor('#4199c2')
        .setTimestamp()
        .setFooter('Nookbot', client.user.displayAvatarURL());

    tools.map(tool => {
        const url = `[${tool.url}](${tool.url})`
        embed.addField(tool.name, url, false)
    })

    return message.channel.send(embed);
};

module.exports.conf = {
  guildOnly: false,
  aliases: [],
  permLevel: 'User',
  args: 0,
};

module.exports.help = {
  name: 'tools',
  category: 'info',
  description: 'Provides a list of popular, third-party apps and websites made for ACNH players.',
  usage: 'tools',
  details: '',
};
