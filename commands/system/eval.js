/* eslint-disable no-eval */
// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level, Discord) => {
  const code = args.join(' ');

  try {
    const evaled = await eval(`(async () => {${code}})()`);
    const clean = await client.clean(client, evaled);

    client.success(message.channel, 'Eval', `\`\`\`js\n${clean}\`\`\``);
  } catch (err) {
    const error = await client.clean(client, err);

    client.error(message.channel, 'Eval', `\`\`\`xl\n${error.split('at', 3).join(' ')}\`\`\``);
  }
};

module.exports.conf = {
  guildOnly: false,
  aliases: [],
  permLevel: 'Bot Admin',
};

module.exports.help = {
  name: 'eval',
  category: 'system',
  description: 'Executes the given JavaScript code',
  usage: 'eval <code>',
  details: '<code> => Any valid JavaScript code',
};
