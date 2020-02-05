module.exports.run = async (client, message, args) => {
  const channel = message.mentions.channels.first();
  const attachments = message.attachments.map((a) => a.url);
  let role;
  switch (args[1]) {
    case 'gamenews':
    case 'game':
    case 'g':
      role = message.guild.roles.get('588955307817041946');
      break;
    case 'servernews':
    case 'server':
    case 's':
      role = message.guild.roles.get('588955864677744642');
      break;
    case 'eventnews':
    case 'event':
    case 'e':
      role = message.guild.roles.get('588955576562614273');
      break;
    default:
      client.error(message.channel, 'Invalid News Role!', 'You must select a valid news role to ping such as \`game\`, \`server\`, or \`event\`.');
      return;
  }
  await role.edit({ mentionable: true });
  await channel.send(`${args.slice(2).join(' ')}\n<@&${role.id}>`, { files: attachments });
  await role.edit({ mentionable: false });
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['n'],
  permLevel: 'Admin',
  args: 2,
};

module.exports.help = {
  name: 'news',
  category: 'misc',
  description: 'Pings members that have the specified news role.',
  usage: 'news <#channel> <game|server|event> <message>',
  details: '<#channel> => The channel to post in.\n<game|server|event> => The news role to ping.\n<message> => The content of the message to send with the ping.',
};
