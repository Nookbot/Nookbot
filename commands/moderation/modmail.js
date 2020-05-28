// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level, Discord) => {
  if (message.guild) {
    message.delete().catch((err) => console.error(err));
  }
  return message.channel.send('Modmail has a new host! This command will no longer work. Please send your message to <@715355702444425296> (Orvbot#6893) for it to be sent to staff. You can find Orvbot at the top of the member list in the AC:NH server!');
};

module.exports.conf = {
  guildOnly: false,
  aliases: ['mod', 'mail', 'mm'],
  permLevel: 'User',
  cooldown: 60,
};

module.exports.help = {
  name: 'modmail',
  category: 'moderation',
  description: 'Modmail is no longer done through Nookbot, please send your mail to Orvbot at the top of the server list',
  usage: 'modmail',
};
