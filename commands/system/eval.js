/* eslint-disable no-eval */
// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level, Discord) => {
  const code = args.join(' ');

  const codeEmbed = new Discord.MessageEmbed()
    .setAuthor('Eval', message.author.displayAvatarURL())
    .addField('Input', `\`\`\`js\n${code}\`\`\``);

  try {
    const evaled = eval(code);
    const clean = await client.clean(client, evaled);

    codeEmbed.setColor('#37ec4b')
      .addField('Output', `\`\`\`js\n${clean}\`\`\``);

    message.channel.send(codeEmbed);
  } catch (err) {
    const error = await client.clean(client, err);

    if (error.length < 1024) {
      codeEmbed.setColor('#eb2219')
        .addField('ERROR', `\`\`\`xl\n${error}\`\`\``);

      message.channel.send(codeEmbed);
    } else {
      message.channel.send(`**ERROR**\nThis error was too long for an embed.\n\n\`\`\`xl\n${error}\`\`\``);
    }
  }
};

module.exports.conf = {
  guildOnly: false,
  aliases: [],
  permLevel: 'Bot Owner',
};

module.exports.help = {
  name: 'eval',
  category: 'system',
  description: 'Executes the given JavaScript code',
  usage: 'eval <code>',
  details: '<code> => Any valid JavaScript code',
};
