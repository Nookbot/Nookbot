module.exports.run = async (client, message, args) => {
  switch (args[0]) {
    case 'game':
    case 'g': {
      const attachments = message.attachments.map((a) => a.url);
      await message.guild.roles.find('588955307817041946').edit({ mentionable: true });
      await message.guild.channels.find('629468250601816097').send(`${args.slice(1).join(' ')}\n<@&588955307817041946>`, { files: attachments });
      await message.guild.roles.find('588955307817041946').edit({ mentionable: false });
      break;
    }
    case 'server':
    case 's': {
      const attachments = message.attachments.map((a) => a.url);
      await message.guild.roles.find('588955864677744642').edit({ mentionable: true });
      await message.guild.channels.find('629468250601816097').send(`${args.slice(1).join(' ')}\n<@&588955864677744642>`, { files: attachments });
      await message.guild.roles.find('588955864677744642').edit({ mentionable: false });
      break;
    }
    case 'event':
    case 'e': {
      const attachments = message.attachments.map((a) => a.url);
      await message.guild.roles.find('588955576562614273').edit({ mentionable: true });
      await message.guild.channels.find('629468250601816097').send(`${args.slice(1).join(' ')}\n<@&588955576562614273>`, { files: attachments });
      await message.guild.roles.find('588955576562614273').edit({ mentionable: false });
      break;
    }
    default:
      break;
  }
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
