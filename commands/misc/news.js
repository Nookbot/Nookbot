module.exports.run = async (client, message, args) => {
  const channel = message.guild.channels.get('629468250601816097');
  const attachments = message.attachments.map((a) => a.url);
  let role;
  switch (args[0]) {
    case 'game':
    case 'g':
      role = message.guild.roles.get('588955307817041946');
      break;
    case 'server':
    case 's':
      role = message.guild.roles.get('588955864677744642');
      break;
    case 'event':
    case 'e':
      role = message.guild.roles.get('588955576562614273');
      break;
    default:
      client.error(message.channel, 'Invalid News Role!', 'You must select a valid news role to ping such as \`game\`, \`server\`, or \`event\`.');
      return;
  }
  await role.edit({ mentionable: true });
  await channel.send(`${args.slice(1).join(' ')}\n<@&${role.id}>`, { files: attachments });
  await role.edit({ mentionable: false });
  return;
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['n'],
  permLevel: 'Admin',
  args: 1,
};

module.exports.help = {
  name: 'news',
  category: 'misc',
  description: 'Pings members that have the specified news role.',
  usage: 'news <game|server|event> <message>',
  details: '<game|server|event> => Which of the news roles to ping.\n<message> => The content of the message to send with the ping.',
};
